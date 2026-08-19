/**
 * Validação de campos do formulário de RSVP. Roda tanto no cliente (feedback
 * imediato) quanto — de forma obrigatória — no servidor, já que o cliente
 * nunca é fonte confiável (ver docs/security/data-mapping.md, nível Base).
 */

export type FieldErrors = Partial<Record<"nome" | "email" | "telefone", string>>;

export interface RsvpInput {
  nome: string;
  email: string;
  telefone: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Aceita telefone brasileiro com ou sem DDI/DDD, com ou sem pontuação:
// 9 dígitos (celular), 8 dígitos (fixo), com 0-2 dígitos de DDD e DDI opcional.
const PHONE_DIGITS_RE = /^\d{10,13}$/;

export function normalizePhoneDigits(telefone: string): string {
  return telefone.replace(/\D/g, "");
}

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

export function isValidPhone(telefone: string): boolean {
  const digits = normalizePhoneDigits(telefone);
  return PHONE_DIGITS_RE.test(digits);
}

export function isValidName(nome: string): boolean {
  return nome.trim().length >= 2 && nome.trim().length <= 120;
}

/**
 * Valida os campos do RSVP e retorna os erros encontrados, um por campo,
 * em linguagem clara (nunca jargão técnico) — ver
 * docs/product/brand/tom-de-voz.md e docs/design-system/matriz-estados.md.
 */
export function validateRsvpInput(input: Partial<RsvpInput>): FieldErrors {
  const errors: FieldErrors = {};

  if (!input.nome || !isValidName(input.nome)) {
    errors.nome = "Conta pra nós seu nome completo, por favor.";
  }

  if (!input.email || !isValidEmail(input.email)) {
    errors.email = "Esse e-mail não parece completo. Confira e tente de novo.";
  }

  if (!input.telefone || !isValidPhone(input.telefone)) {
    errors.telefone = "Esse telefone não parece completo. Inclua o DDD, por favor.";
  }

  return errors;
}

export function isRsvpInputValid(input: Partial<RsvpInput>): boolean {
  return Object.keys(validateRsvpInput(input)).length === 0;
}
