import { getGiftIdeas, type GiftIdea } from "@/lib/google/sheets";
import { generatePixQrCodeDataUrl } from "@/lib/pix/qrcode";

export interface GiftListData {
  gifts: GiftIdea[];
  pix: { code: string; qrCodeDataUrl: string } | null;
}

/**
 * Busca a lista de presentes e monta o bloco de Pix. Nunca lança: um
 * problema aqui (planilha fora do ar, `PIX_CODE` ainda não configurado)
 * não pode quebrar a confirmação de presença, que é o fluxo crítico —
 * na pior hipótese, a seção de presentes aparece vazia/sem Pix.
 */
export async function getGiftListData(): Promise<GiftListData> {
  let gifts: GiftIdea[] = [];
  try {
    gifts = await getGiftIdeas();
  } catch (error) {
    console.error("[gifts] falha ao buscar lista de presentes", error instanceof Error ? error.message : error);
  }

  const pixCode = process.env.PIX_CODE;
  let pix: GiftListData["pix"] = null;
  if (pixCode) {
    try {
      pix = { code: pixCode, qrCodeDataUrl: await generatePixQrCodeDataUrl(pixCode) };
    } catch (error) {
      console.error("[gifts] falha ao gerar QR code do Pix", error instanceof Error ? error.message : error);
    }
  }

  return { gifts, pix };
}
