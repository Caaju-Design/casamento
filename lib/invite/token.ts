import { createHmac } from "node:crypto";
import { getInviteByToken, type GuestInvite } from "@/lib/google/sheets";

/**
 * Formato aceito para o token de convite: string opaca, não sequencial,
 * gerada pelo casal ao montar a lista de convidados (ver
 * docs/architecture/adr/0003-acesso-sem-login-e-link-unico-por-convidado.md).
 * Esta checagem estrutural roda antes de qualquer chamada à API do Google —
 * rejeita lixo evidente (token vazio, caracteres inesperados, tamanho fora
 * do razoável) sem gastar cota da API (ver docs/architecture/risks.md).
 */
const TOKEN_FORMAT_RE = /^[A-Za-z0-9_-]{6,128}$/;

export function hasPlausibleTokenFormat(token: string | null | undefined): token is string {
  return typeof token === "string" && TOKEN_FORMAT_RE.test(token);
}

export type InviteLookupResult =
  | { status: "found"; invite: GuestInvite }
  | { status: "invalid_format" }
  | { status: "not_found" }
  | { status: "unavailable" };

/**
 * Resolve um token de convite em um convite de convidado, sempre validando
 * no servidor (nunca confiando em estado do cliente) — ver ADR-0003 e
 * docs/security/data-mapping.md.
 *
 * Falha da API do Google (credencial ausente, cota, indisponibilidade — ver
 * docs/architecture/risks.md) é distinguida de "convite não encontrado":
 * a primeira é um problema nosso, temporário; a segunda é do link em si.
 * Conflar as duas mostraria "convite não encontrado" para um convidado
 * legítimo só porque a planilha está fora do ar.
 */
export async function resolveInvite(token: string | null | undefined): Promise<InviteLookupResult> {
  if (!hasPlausibleTokenFormat(token)) {
    return { status: "invalid_format" };
  }

  let invite: GuestInvite | null;
  try {
    invite = await getInviteByToken(token);
  } catch {
    return { status: "unavailable" };
  }

  if (!invite) {
    return { status: "not_found" };
  }

  return { status: "found", invite };
}

/**
 * Deriva um identificador estável e não reversível do token, usado só como
 * chave interna (ex.: chave de rate limit) — nunca logamos o token em texto
 * puro (ver docs/security/data-mapping.md, seção "Logs e auditoria").
 */
export function hashTokenForInternalUse(token: string): string {
  const secret = process.env.INVITE_TOKEN_SECRET ?? "";
  return createHmac("sha256", secret).update(token).digest("hex").slice(0, 32);
}
