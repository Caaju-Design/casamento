import { describe, expect, it } from "vitest";
import { isValidEmail, isValidName, isValidPhone, validateRsvpInput } from "@/lib/validation";

describe("isValidEmail", () => {
  it("aceita e-mails bem formados", () => {
    expect(isValidEmail("maria@example.com")).toBe(true);
    expect(isValidEmail("joao.silva@dominio.com.br")).toBe(true);
  });

  it("rejeita e-mails sem @, sem domínio ou vazios", () => {
    expect(isValidEmail("maria-example.com")).toBe(false);
    expect(isValidEmail("maria@")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isValidPhone", () => {
  it("aceita telefone brasileiro com DDD, com ou sem máscara", () => {
    expect(isValidPhone("(11) 91234-5678")).toBe(true);
    expect(isValidPhone("11912345678")).toBe(true);
    expect(isValidPhone("+55 11 91234-5678")).toBe(true);
  });

  it("rejeita telefone incompleto", () => {
    expect(isValidPhone("1234-567")).toBe(false);
    expect(isValidPhone("")).toBe(false);
  });
});

describe("isValidName", () => {
  it("aceita nome com pelo menos 2 caracteres úteis", () => {
    expect(isValidName("Ana")).toBe(true);
  });

  it("rejeita nome vazio ou só espaço", () => {
    expect(isValidName("  ")).toBe(false);
    expect(isValidName("")).toBe(false);
  });
});

describe("validateRsvpInput", () => {
  it("não retorna erros para dados completos e válidos", () => {
    const errors = validateRsvpInput({ nome: "Maria Silva", email: "maria@example.com", telefone: "11912345678" });
    expect(errors).toEqual({});
  });

  it("retorna um erro por campo problemático, em linguagem clara", () => {
    const errors = validateRsvpInput({ nome: "", email: "invalido", telefone: "123" });
    expect(errors.nome).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.telefone).toBeDefined();
    expect(errors.nome).not.toMatch(/regex|null|undefined/i);
  });
});
