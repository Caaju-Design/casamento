"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";

export interface GiftCardProps {
  title: string;
  description: string;
  /** Código Pix copia-e-cola estático (sem gateway, sem registro de pagador — ver ADR-0002). */
  pixCode: string;
  /** Caminho da imagem do QR code estático do Pix. */
  qrCodeSrc: string;
}

/** Molecule `GiftCard` (presente + botão de Pix) — lista de presentes exibida após o RSVP. */
export function GiftCard({ title, description, pixCode, qrCodeSrc }: GiftCardProps) {
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
    <div className="flex flex-col gap-field-gap rounded-card bg-accent p-card-padding shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrCodeSrc} alt={`QR code Pix para o presente ${title}`} className="mx-auto h-40 w-40 object-contain" />
      <Heading as="h3" size="sm">
        {title}
      </Heading>
      <Text tone="secondary">{description}</Text>
      <Button type="button" variant="secondary" onClick={handleCopyPixCode}>
        {copyState === "copiado" ? "Código copiado!" : copyState === "erro" ? "Não deu para copiar" : "Copiar código Pix"}
      </Button>
    </div>
  );
}
