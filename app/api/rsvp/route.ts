import { NextRequest, NextResponse } from "next/server";
import { resolveInvite, hashTokenForInternalUse } from "@/lib/invite/token";
import { validateRsvpInput } from "@/lib/validation";
import { recordRsvp } from "@/lib/google/sheets";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

// Nunca confiar em validação feita só no cliente — este endpoint valida tudo
// de novo no servidor (nível de segurança Base, ver docs/security/data-mapping.md).
export const dynamic = "force-dynamic";

const RATE_LIMIT = { limit: 5, windowMs: 60_000 };
const GOOGLE_TIMEOUT_MS = 8_000;

class TimeoutError extends Error {}

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
  extra?: Record<string, unknown>,
  headers?: Record<string, string>,
) {
  return NextResponse.json({ ok: false, error: { code, message, ...extra } }, { status, headers });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(
      400,
      "validation_error",
      "Não conseguimos ler os dados enviados. Confirma se preencheu o formulário e tenta de novo.",
    );
  }

  const { token, nome, email, telefone } = (body ?? {}) as Record<string, unknown>;
  const tokenValue = typeof token === "string" ? token : null;

  const rateLimitKey = `rsvp:${getClientIdentifier(request)}:${
    tokenValue ? hashTokenForInternalUse(tokenValue) : "sem-token"
  }`;
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT);
  if (!rateLimit.allowed) {
    return errorResponse(
      429,
      "rate_limited",
      "Você tentou confirmar presença muitas vezes em pouco tempo. Espera um instante e tenta de novo.",
      undefined,
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

  const fieldErrors = validateRsvpInput({
    nome: typeof nome === "string" ? nome : undefined,
    email: typeof email === "string" ? email : undefined,
    telefone: typeof telefone === "string" ? telefone : undefined,
  });
  if (Object.keys(fieldErrors).length > 0) {
    return errorResponse(400, "validation_error", "Alguns campos precisam de um ajuste antes de confirmar.", {
      fieldErrors,
    });
  }

  try {
    await withTimeout(
      recordRsvp(lookup.invite.token, {
        nome: nome as string,
        email: email as string,
        telefone: telefone as string,
      }),
      GOOGLE_TIMEOUT_MS,
    );
  } catch (error) {
    if (error instanceof TimeoutError) {
      return errorResponse(
        504,
        "timeout",
        "Isso está demorando mais do que devia. Tenta confirmar de novo em alguns instantes.",
      );
    }
    // Nunca vazar detalhe interno (stack trace, mensagem crua da API) para o convidado.
    console.error("[rsvp] falha ao gravar confirmação", error instanceof Error ? error.message : error);
    return errorResponse(
      503,
      "backend_unavailable",
      "Não conseguimos confirmar sua presença agora. Tenta novamente em alguns minutos.",
    );
  }

  return NextResponse.json({ ok: true, nome: lookup.invite.nome || (nome as string) });
}
