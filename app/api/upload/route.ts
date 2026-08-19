import { NextRequest, NextResponse } from "next/server";
import { resolveInvite, hashTokenForInternalUse } from "@/lib/invite/token";
import { validateGuestPhoto, getMaxUploadSizeBytes } from "@/lib/file-validation";
import { uploadGuestPhoto, saveGuestMessage } from "@/lib/google/drive";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

// Nunca confiar em extensão/Content-Type declarado pelo navegador — o
// conteúdo real do arquivo é verificado a cada envio (ver lib/file-validation.ts).
export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 30, windowMs: 10 * 60_000 };
const GOOGLE_TIMEOUT_MS = 15_000;
const MAX_MESSAGE_LENGTH = 2000;

class TimeoutError extends Error {}

/**
 * Verifica se um valor de FormData é um arquivo, por estrutura (duck typing)
 * em vez de `instanceof File`. Isso evita falso-negativo quando o valor
 * vem de uma implementação de File de outro realm (ex.: o parser de
 * multipart do runtime pode reconstruir o arquivo com sua própria classe
 * File interna, distinta do `File` global do módulo).
 */
function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as File).arrayBuffer === "function" &&
    typeof (value as File).size === "number" &&
    typeof (value as File).name === "string"
  );
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new TimeoutError("TIMEOUT")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  headers?: Record<string, string>,
) {
  return NextResponse.json({ ok: false, error: { code, message } }, { status, headers });
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(
      400,
      "validation_error",
      "Não conseguimos ler o que foi enviado. Tenta escolher a foto ou escrever a mensagem de novo.",
    );
  }

  const tokenEntry = formData.get("token");
  const tokenValue = typeof tokenEntry === "string" ? tokenEntry : null;

  const rateLimitKey = `upload:${getClientIdentifier(request)}:${
    tokenValue ? hashTokenForInternalUse(tokenValue) : "sem-token"
  }`;
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT);
  if (!rateLimit.allowed) {
    return errorResponse(
      429,
      "rate_limited",
      "Foram muitos envios em pouco tempo. Espera um pouquinho antes de tentar de novo.",
      { "Retry-After": String(rateLimit.retryAfterSeconds) },
    );
  }

  const lookup = await resolveInvite(tokenValue);
  if (lookup.status !== "found") {
    return errorResponse(
      404,
      "invite_not_found",
      "Não encontramos o seu convite. Confira se o link está completo ou fale com o casal.",
    );
  }

  const fotoEntry = formData.get("foto");
  const mensagemEntry = formData.get("mensagem");
  const mensagem = typeof mensagemEntry === "string" ? mensagemEntry.trim() : "";
  const foto = isUploadedFile(fotoEntry) && fotoEntry.size > 0 ? fotoEntry : null;

  if (!foto && !mensagem) {
    return errorResponse(
      400,
      "validation_error",
      "Escolhe uma foto ou escreve uma mensagem para enviar ao casal.",
    );
  }

  if (mensagem.length > MAX_MESSAGE_LENGTH) {
    return errorResponse(
      400,
      "validation_error",
      `Essa mensagem ficou grande demais (até ${MAX_MESSAGE_LENGTH} caracteres). Tenta resumir um pouquinho.`,
    );
  }

  let photoBytes: Uint8Array | null = null;
  if (foto) {
    if (foto.size > getMaxUploadSizeBytes()) {
      const maxMb = Math.round(getMaxUploadSizeBytes() / (1024 * 1024));
      return errorResponse(
        400,
        "validation_error",
        `Essa foto passou do tamanho que aceitamos (até ${maxMb}MB). Tenta uma foto um pouco mais leve.`,
      );
    }
    const buffer = await foto.arrayBuffer();
    photoBytes = new Uint8Array(buffer);
    const validation = validateGuestPhoto(photoBytes, photoBytes.byteLength);
    if (!validation.valid) {
      return errorResponse(400, "validation_error", validation.errorMessage ?? "Não conseguimos aceitar esse arquivo.");
    }
  }

  try {
    if (photoBytes) {
      await withTimeout(
        uploadGuestPhoto(lookup.invite.token, {
          filename: foto?.name || "foto.jpg",
          mimeType: foto?.type || "image/jpeg",
          bytes: photoBytes,
        }),
        GOOGLE_TIMEOUT_MS,
      );
    }
    if (mensagem) {
      await withTimeout(saveGuestMessage(lookup.invite.token, mensagem), GOOGLE_TIMEOUT_MS);
    }
  } catch (error) {
    if (error instanceof TimeoutError) {
      return errorResponse(
        504,
        "timeout",
        "O envio está demorando mais do que devia. Tenta de novo em alguns instantes.",
      );
    }
    console.error("[upload] falha ao enviar para o Drive", error instanceof Error ? error.message : error);
    return errorResponse(
      503,
      "backend_unavailable",
      "Não conseguimos enviar isso agora. Tenta novamente em alguns minutos.",
    );
  }

  return NextResponse.json({ ok: true });
}
