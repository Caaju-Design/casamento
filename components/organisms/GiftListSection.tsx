import { GiftCard } from "@/components/molecules/GiftCard";
import { PixBlock } from "@/components/molecules/PixBlock";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import type { GiftIdea } from "@/lib/google/sheets";

export interface GiftListSectionProps {
  gifts: GiftIdea[];
  pix: { code: string; qrCodeDataUrl: string } | null;
}

/** Organism `GiftListSection` — exibida ao convidado após a confirmação de presença. */
export function GiftListSection({ gifts, pix }: GiftListSectionProps) {
  return (
    <section id="presentes" className="mx-auto max-w-4xl px-6 py-section-gap">
      <Heading className="text-center">Lista de presentes</Heading>
      <Text tone="secondary" className="mx-auto mt-4 max-w-xl text-center">
        Sua presença já é o maior presente. Se quiser nos ajudar a começar essa nova fase, aqui estão algumas
        ideias — a contribuição é via Pix, no valor que fizer sentido para você.
      </Text>

      {gifts.length > 0 ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {gifts.map((gift) => (
            <GiftCard key={gift.titulo} title={gift.titulo} description={gift.descricao} />
          ))}
        </div>
      ) : (
        <Text tone="secondary" className="mt-10 text-center">
          Estamos preparando a lista — volte aqui em breve.
        </Text>
      )}

      {pix ? <PixBlock pixCode={pix.code} qrCodeDataUrl={pix.qrCodeDataUrl} /> : null}
    </section>
  );
}
