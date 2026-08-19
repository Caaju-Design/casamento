import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/google/sheets", () => ({
  getInviteByToken: vi.fn(),
}));

import { getInviteByToken } from "@/lib/google/sheets";
import { hasPlausibleTokenFormat, resolveInvite } from "@/lib/invite/token";

const mockedGetInviteByToken = vi.mocked(getInviteByToken);

beforeEach(() => {
  mockedGetInviteByToken.mockReset();
});

describe("hasPlausibleTokenFormat", () => {
  it("aceita tokens com formato plausível (alfanumérico, tamanho razoável)", () => {
    expect(hasPlausibleTokenFormat("abc123XYZ-token_9")).toBe(true);
  });

  it("rejeita token vazio, nulo, indefinido ou curto demais", () => {
    expect(hasPlausibleTokenFormat("")).toBe(false);
    expect(hasPlausibleTokenFormat(null)).toBe(false);
    expect(hasPlausibleTokenFormat(undefined)).toBe(false);
    expect(hasPlausibleTokenFormat("abc")).toBe(false);
  });

  it("rejeita token com caracteres inesperados", () => {
    expect(hasPlausibleTokenFormat("token com espaço e /barra")).toBe(false);
  });
});

describe("resolveInvite", () => {
  it("token válido e encontrado na planilha retorna o convite", async () => {
    mockedGetInviteByToken.mockResolvedValue({ token: "abc123XYZ", nome: "Maria", status: "pendente" });

    const result = await resolveInvite("abc123XYZ");

    expect(result.status).toBe("found");
    if (result.status === "found") {
      expect(result.invite.nome).toBe("Maria");
    }
  });

  it("token com formato plausível mas ausente na planilha retorna 'não encontrado'", async () => {
    mockedGetInviteByToken.mockResolvedValue(null);

    const result = await resolveInvite("naoexisteXYZ123");

    expect(result.status).toBe("not_found");
  });

  it("token com formato inválido nem chega a consultar a planilha (evita gastar cota da API)", async () => {
    const result = await resolveInvite("a b/c");

    expect(result.status).toBe("invalid_format");
    expect(mockedGetInviteByToken).not.toHaveBeenCalled();
  });

  it("falha da API do Google (credencial ausente, cota, indisponibilidade) retorna 'unavailable', não 'not_found'", async () => {
    mockedGetInviteByToken.mockRejectedValue(new Error("Credenciais da conta de serviço do Google não configuradas"));

    const result = await resolveInvite("abc123XYZ");

    expect(result.status).toBe("unavailable");
  });
});
