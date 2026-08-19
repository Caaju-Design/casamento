import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { resetRateLimitState } from "@/lib/rate-limit";

vi.mock("@/lib/google/sheets", () => ({
  getInviteByToken: vi.fn(),
}));

vi.mock("@/lib/google/drive", () => ({
  uploadGuestPhoto: vi.fn(),
  saveGuestMessage: vi.fn(),
}));

import { getInviteByToken } from "@/lib/google/sheets";
import { saveGuestMessage, uploadGuestPhoto } from "@/lib/google/drive";
import { POST } from "@/app/api/upload/route";

const mockedGetInviteByToken = vi.mocked(getInviteByToken);
const mockedUploadGuestPhoto = vi.mocked(uploadGuestPhoto);
const mockedSaveGuestMessage = vi.mocked(saveGuestMessage);

const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
// Assinatura de vídeo MP4 — usada para confirmar que a rota rejeita vídeo.
const MP4_BYTES = new Uint8Array([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);

function buildRequest(formData: FormData) {
  return new NextRequest("http://localhost/api/upload", { method: "POST", body: formData });
}

beforeEach(() => {
  resetRateLimitState();
  mockedGetInviteByToken.mockReset();
  mockedUploadGuestPhoto.mockReset();
  mockedSaveGuestMessage.mockReset();
});

describe("POST /api/upload — golden path", () => {
  it("token válido e imagem válida são enviados ao Drive com sucesso", async () => {
    mockedGetInviteByToken.mockResolvedValue({ token: "abc123XYZ", nome: "Maria", status: "confirmado" });
    mockedUploadGuestPhoto.mockResolvedValue({ fileId: "file-1" });

    const formData = new FormData();
    formData.set("token", "abc123XYZ");
    formData.set("foto", new File([JPEG_BYTES], "foto.jpg", { type: "image/jpeg" }));

    const response = await POST(buildRequest(formData));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockedUploadGuestPhoto).toHaveBeenCalledTimes(1);
    expect(mockedUploadGuestPhoto.mock.calls[0]?.[0]).toBe("abc123XYZ");
  });

  it("mensagem/depoimento válido é salvo como Google Doc", async () => {
    mockedGetInviteByToken.mockResolvedValue({ token: "abc123XYZ", nome: "Maria", status: "confirmado" });
    mockedSaveGuestMessage.mockResolvedValue({ documentId: "doc-1" });

    const formData = new FormData();
    formData.set("token", "abc123XYZ");
    formData.set("mensagem", "Que alegria por vocês dois!");

    const response = await POST(buildRequest(formData));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(mockedSaveGuestMessage).toHaveBeenCalledWith("abc123XYZ", "Que alegria por vocês dois!");
  });
});

describe("POST /api/upload — outros estados", () => {
  it("rejeita vídeo disfarçado de imagem, mesmo com Content-Type de imagem", async () => {
    mockedGetInviteByToken.mockResolvedValue({ token: "abc123XYZ", nome: "Maria", status: "confirmado" });

    const formData = new FormData();
    formData.set("token", "abc123XYZ");
    formData.set("foto", new File([MP4_BYTES], "video-disfarcado.jpg", { type: "image/jpeg" }));

    const response = await POST(buildRequest(formData));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(mockedUploadGuestPhoto).not.toHaveBeenCalled();
  });

  it("token não encontrado retorna 404", async () => {
    mockedGetInviteByToken.mockResolvedValue(null);

    const formData = new FormData();
    formData.set("token", "naoexisteXYZ123");
    formData.set("mensagem", "oi");

    const response = await POST(buildRequest(formData));
    expect(response.status).toBe(404);
  });

  it("falha do Drive retorna estado de backend indisponível sem stack trace", async () => {
    mockedGetInviteByToken.mockResolvedValue({ token: "abc123XYZ", nome: "Maria", status: "confirmado" });
    mockedUploadGuestPhoto.mockRejectedValue(new Error("erro interno da API do Drive"));

    const formData = new FormData();
    formData.set("token", "abc123XYZ");
    formData.set("foto", new File([JPEG_BYTES], "foto.jpg", { type: "image/jpeg" }));

    const response = await POST(buildRequest(formData));
    const data = await response.json();

    expect(response.status).toBe(503);
    expect(data.error.message).not.toContain("erro interno");
  });
});
