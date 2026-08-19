import { afterEach, describe, expect, it, vi } from "vitest";
import { detectImageType, validateGuestPhoto } from "@/lib/file-validation";

const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
// Assinatura de um vídeo MP4 (box "ftyp") — não deve ser aceita como imagem.
const MP4_BYTES = new Uint8Array([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]);
const TEXT_BYTES = new TextEncoder().encode("isso não é uma imagem");

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("detectImageType", () => {
  it("reconhece JPEG e PNG pelos bytes reais, independente da extensão", () => {
    expect(detectImageType(JPEG_BYTES)).toBe("jpeg");
    expect(detectImageType(PNG_BYTES)).toBe("png");
  });

  it("rejeita vídeo (mp4) mesmo que alguém tente enviar como se fosse imagem", () => {
    expect(detectImageType(MP4_BYTES)).toBeNull();
  });

  it("rejeita conteúdo arbitrário que não é nenhum formato de imagem aceito", () => {
    expect(detectImageType(TEXT_BYTES)).toBeNull();
  });
});

describe("validateGuestPhoto", () => {
  it("aceita uma foto JPEG dentro do limite de tamanho", () => {
    const result = validateGuestPhoto(JPEG_BYTES, 1024);
    expect(result.valid).toBe(true);
  });

  it("rejeita vídeo com mensagem em linguagem clara, sem jargão técnico", () => {
    const result = validateGuestPhoto(MP4_BYTES, 1024);
    expect(result.valid).toBe(false);
    expect(result.errorMessage).toMatch(/foto/i);
    expect(result.errorMessage).not.toMatch(/magic byte|mime|buffer/i);
  });

  it("rejeita arquivo vazio", () => {
    const result = validateGuestPhoto(JPEG_BYTES, 0);
    expect(result.valid).toBe(false);
  });

  it("rejeita arquivo maior que o limite configurado (env UPLOAD_MAX_FILE_SIZE_BYTES)", () => {
    vi.stubEnv("UPLOAD_MAX_FILE_SIZE_BYTES", "1000");
    const result = validateGuestPhoto(JPEG_BYTES, 2000);
    expect(result.valid).toBe(false);
    expect(result.errorMessage).toMatch(/tamanho/i);
  });

  it("usa o padrão de 10MB quando a variável de ambiente não está definida", () => {
    vi.stubEnv("UPLOAD_MAX_FILE_SIZE_BYTES", "");
    const result = validateGuestPhoto(JPEG_BYTES, 10 * 1024 * 1024 + 1);
    expect(result.valid).toBe(false);
  });
});
