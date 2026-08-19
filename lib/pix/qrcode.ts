import QRCode from "qrcode";

/**
 * Gera o QR code do Pix a partir do próprio código copia-e-cola — evita
 * depender de imagem pronta enviada pelo casal (ver
 * docs/architecture/adr/0002-armazenamento-em-google-sheets-e-drive.md:
 * Pix estático, sem gateway, sem registro de pagador).
 */
export async function generatePixQrCodeDataUrl(pixCode: string): Promise<string> {
  return QRCode.toDataURL(pixCode, { margin: 1, width: 320 });
}
