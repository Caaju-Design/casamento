/**
 * Validação de arquivo enviado no upload de foto do convidado.
 *
 * Nunca confia em nome de arquivo nem em Content-Type declarado pelo
 * navegador — ambos podem ser forjados. A verificação real olha os
 * primeiros bytes do arquivo (assinatura/"magic bytes") para confirmar que o
 * conteúdo é de fato uma imagem, rejeitando vídeo mesmo que renomeado com
 * extensão de imagem.
 */

export type DetectedImageType = "jpeg" | "png" | "webp" | "gif";

const DEFAULT_MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB, mesmo padrão do .env.example

export function getMaxUploadSizeBytes(): number {
  const raw = process.env.UPLOAD_MAX_FILE_SIZE_BYTES;
  const parsed = raw ? Number(raw) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_FILE_SIZE_BYTES;
}

function matchesSignature(bytes: Uint8Array, signature: Array<number | null>): boolean {
  if (bytes.length < signature.length) return false;
  for (let i = 0; i < signature.length; i += 1) {
    const expected = signature[i];
    if (expected !== null && bytes[i] !== expected) return false;
  }
  return true;
}

/**
 * Detecta o tipo real de imagem a partir dos bytes iniciais do arquivo.
 * Retorna `null` quando o conteúdo não corresponde a nenhum formato de
 * imagem aceito (isso inclui qualquer vídeo).
 */
export function detectImageType(bytes: Uint8Array): DetectedImageType | null {
  if (matchesSignature(bytes, [0xff, 0xd8, 0xff])) return "jpeg";
  if (matchesSignature(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "png";
  if (matchesSignature(bytes, [0x47, 0x49, 0x46, 0x38, null, 0x61])) return "gif";
  if (
    matchesSignature(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes.length >= 12 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

export function isImageContent(bytes: Uint8Array): boolean {
  return detectImageType(bytes) !== null;
}

export interface FileValidationResult {
  valid: boolean;
  /** Mensagem em linguagem clara, pronta para mostrar ao convidado. */
  errorMessage?: string;
}

export function validateGuestPhoto(bytes: Uint8Array, sizeBytes: number): FileValidationResult {
  const maxSize = getMaxUploadSizeBytes();

  if (sizeBytes <= 0) {
    return { valid: false, errorMessage: "Esse arquivo chegou vazio. Tenta escolher a foto de novo." };
  }

  if (sizeBytes > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      errorMessage: `Essa foto passou do tamanho que aceitamos (até ${maxMb}MB). Tenta uma foto um pouco mais leve.`,
    };
  }

  if (!isImageContent(bytes)) {
    return {
      valid: false,
      errorMessage: "Só conseguimos guardar fotos por aqui (sem vídeo). Envia uma imagem em JPG, PNG, WEBP ou GIF.",
    };
  }

  return { valid: true };
}
