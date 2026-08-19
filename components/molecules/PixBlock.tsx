"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Text } from "@/components/atoms/Text";

export interface PixBlockProps {
  pixCode: string;
  qrCodeDataUrl: string;
}

/** Molecule `PixBlock` — código Pix único e QR compartilhado por toda a lista de presentes. */
export function PixBlock({ pixCode, qrCodeDataUrl }: PixBlockProps) {
  const [copyState, setCopyState] = useState<"idle" | "copiado" | "erro">("idle");

  async function handleCopyPixCode() {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopyState("copiado");
    } catch {
      setCopyState("erro");
    } finally {
      setTimeout(() => setCopyState("idle"), 3000);
    }
  }

  return (
    <div className="mx-auto mt-10 flex max-w-sm flex-col items-center gap-field-gap rounded-card bg-surface p-card-padding text-center shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrCodeDataUrl} alt="QR code Pix" className="h-40 w-40 object-contain" />
      <Text tone="secondary">Escaneie o QR code ou copie o código Pix abaixo — contribua com o valor que fizer sentido para você.</Text>
      <Button type="button" variant="secondary" onClick={handleCopyPixCode}>
        {copyState === "copiado" ? "Código copiado!" : copyState === "erro" ? "Não deu para copiar" : "Copiar código Pix"}
      </Button>
    </div>
  );
}
