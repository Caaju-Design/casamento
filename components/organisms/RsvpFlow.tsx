"use client";

import { useState } from "react";
import { Heading } from "@/components/atoms/Heading";
import { Icon } from "@/components/atoms/Icon";
import { Text } from "@/components/atoms/Text";
import { GiftListSection } from "@/components/organisms/GiftListSection";
import { RsvpForm } from "@/components/organisms/RsvpForm";
import { TestimonialSection } from "@/components/organisms/TestimonialSection";
import type { GiftListData } from "@/lib/gifts";

export interface RsvpFlowProps {
  token: string;
  initialNome?: string;
  /** Estado inicial vindo da planilha — se já confirmado antes, pula direto para os presentes. */
  alreadyConfirmed?: boolean;
  giftList?: GiftListData;
}

const EMPTY_GIFT_LIST: GiftListData = { gifts: [], pix: null };

/**
 * Orquestra o estado "vazio" (confirmação ainda não feita) e o estado de
 * sucesso do RSVP (ver docs/design-system/matriz-estados.md), decidindo
 * quando mostrar o formulário ou a lista de presentes + depoimento.
 */
export function RsvpFlow({ token, initialNome, alreadyConfirmed = false, giftList = EMPTY_GIFT_LIST }: RsvpFlowProps) {
  const [confirmedNome, setConfirmedNome] = useState<string | null>(alreadyConfirmed ? initialNome ?? "" : null);

  if (confirmedNome === null) {
    return (
      <section id="confirmar-presenca" className="flex flex-col items-center gap-6 px-6 py-section-gap">
        <Heading className="text-center">
          {initialNome ? `${initialNome}, você vem celebrar com a gente?` : "Você vem celebrar com a gente?"}
        </Heading>
        <Text tone="secondary" className="max-w-md text-center">
          Ainda não recebemos sua confirmação. Preencha os campos abaixo — leva menos de um minuto.
        </Text>
        <RsvpForm token={token} initialNome={initialNome} onConfirmed={setConfirmedNome} />
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-section-gap">
      <section className="flex flex-col items-center gap-4 px-6 py-section-gap text-center">
        <Icon name="check" size={32} className="text-feedback-success" />
        <Heading>Presença confirmada, {confirmedNome}!</Heading>
        <Text tone="secondary" className="max-w-md">
          Ficamos muito felizes em saber que você vai estar com a gente nesse dia. Obrigado por fazer parte da
          nossa história.
        </Text>
      </section>
      <TestimonialSection token={token} />
      <GiftListSection gifts={giftList.gifts} pix={giftList.pix} />
    </div>
  );
}
