/**
 * Limite de taxa básico (nível de segurança Base — ver
 * docs/security/data-mapping.md), em memória do processo.
 *
 * Decisão de projeto: dado o prazo e o porte de teste Mínimo
 * (docs/product/bootstrap-state.md), não provisionamos um armazenamento
 * externo (ex.: Redis) só para rate limit. Isso significa que em produção
 * serverless (Vercel) o contador é por instância/lambda, não global — uma
 * limitação aceita conscientemente, suficiente para conter abuso trivial de
 * um formulário público sem adicionar infraestrutura nova.
 */

interface Bucket {
  count: number;
  windowStartMs: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  /** Segundos até a janela atual liberar novamente. */
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
  now: number = Date.now(),
): RateLimitResult {
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStartMs >= windowMs) {
    buckets.set(key, { count: 1, windowStartMs: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count < limit) {
    existing.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  const retryAfterMs = windowMs - (now - existing.windowStartMs);
  return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
}

/** Só para os testes conseguirem partir de um estado limpo. */
export function resetRateLimitState(): void {
  buckets.clear();
}

export function getClientIdentifier(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "desconhecido";
}
