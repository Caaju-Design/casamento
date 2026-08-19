import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { resetRateLimitState } from "@/lib/rate-limit";

vi.mock("@/lib/google/sheets", () => ({
  getInviteByToken: vi.fn(),
  recordRsvp: vi.fn(),
}));

import { getInviteByToken, recordRsvp } from "@/lib/google/sheets";
import { POST } from "@/app/api/rsvp/route";

const mockedGetInviteByToken = vi.mocked(getInviteByToken);
const mockedRecordRsvp = vi.mocked(recordRsvp);

function buildRequest(body: unknown) {
  return new NextRequest("http://localhost/api/rsvp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  resetRateLimitState();
  mockedGetInviteByToken.mockReset();
  mockedRecordRsvp.mockReset();
});

describe("POST /api/rsvp — golden path", () => {
  it("confirma presença com token válido e campos válidos", async () => {
    mockedGetInviteByToken.mockResolvedValue({ token: "abc123XYZ", nome: "Maria", status: "pendente" });
    mockedRecordRsvp.mockResolvedValue(undefined);

    const response = await POST(
      buildRequest({ token: "abc123XYZ", nome: "Maria Silva", email: "maria@example.com", telefone: "11912345678" }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockedRecordRsvp).toHaveBeenCalledWith("abc123XYZ", {
      nome: "Maria Silva",
      email: "maria@example.com",
      telefone: "11912345678",
    });
  });
});

describe("POST /api/rsvp — outros estados", () => {
  it("token não encontrado retorna 404 sem vazar detalhe técnico", async () => {
    mockedGetInviteByToken.mockResolvedValue(null);

    const response = await POST(
      buildRequest({ token: "naoexisteXYZ123", nome: "Maria", email: "maria@example.com", telefone: "11912345678" }),
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.ok).toBe(false);
    expect(data.error.message.toLowerCase()).not.toContain("token");
    expect(mockedRecordRsvp).not.toHaveBeenCalled();
  });

  it("campos inválidos retornam 400 com erro por campo", async () => {
    mockedGetInviteByToken.mockResolvedValue({ token: "abc123XYZ", nome: "", status: "pendente" });

    const response = await POST(buildRequest({ token: "abc123XYZ", nome: "", email: "invalido", telefone: "1" }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error.fieldErrors.nome).toBeDefined();
    expect(data.error.fieldErrors.email).toBeDefined();
    expect(data.error.fieldErrors.telefone).toBeDefined();
  });

  it("backend do Google indisponível retorna 503 sem vazar stack trace", async () => {
    mockedGetInviteByToken.mockResolvedValue({ token: "abc123XYZ", nome: "Maria", status: "pendente" });
    mockedRecordRsvp.mockRejectedValue(new Error("boom interno da API do Google"));

    const response = await POST(
      buildRequest({ token: "abc123XYZ", nome: "Maria Silva", email: "maria@example.com", telefone: "11912345678" }),
    );
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error.message).not.toContain("boom interno");
  });

  it("limite de taxa excedido retorna 429 após repetidas tentativas", async () => {
    mockedGetInviteByToken.mockResolvedValue({ token: "abc123XYZ", nome: "Maria", status: "pendente" });
    mockedRecordRsvp.mockResolvedValue(undefined);

    const payload = { token: "abc123XYZ", nome: "Maria Silva", email: "maria@example.com", telefone: "11912345678" };
    let lastResponse;
    for (let i = 0; i < 6; i += 1) {
      lastResponse = await POST(buildRequest(payload));
    }

    expect(lastResponse?.status).toBe(429);
  });
});
