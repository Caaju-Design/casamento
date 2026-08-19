import { GiftCard } from "@/components/molecules/GiftCard";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";

interface Gift {
  title: string;
  description: string;
  pixCode: string;
  qrCodeSrc: string;
}

// Pix estático (copia-e-cola + QR), sem gateway de pagamento e sem registro
// de quem pagou — ver docs/architecture/adr/0002-armazenamento-em-google-sheets-e-drive.md.
// Conteúdo real (itens, chave Pix, imagens de QR) é pendência do casal
// (docs/product/pendencias.md) — os valores abaixo são placeholder.
const GIFTS: Gift[] = [
  {
    title: "Lua de mel",
    description: "Ajude a construir a viagem dos sonhos do casal com uma contribuição, do tamanho que fizer sentido para você.",
    pixCode: "00020126580014BR.GOV.BCB.PIX0136chave-pix-a-definir5204000053039865802BR5913NOME E NOME6009SAO PAULO62070503***6304ABCD",
    qrCodeSrc: "/gifts/qr-lua-de-mel.svg",
  },
  {
    title: "Nova casa",
    description: "Um empurrãozinho para equipar a casa nova do casal.",
    pixCode: "00020126580014BR.GOV.BCB.PIX0136chave-pix-a-definir5204000053039865802BR5913NOME E NOME6009SAO PAULO62070503***6304EFGH",
    qrCodeSrc: "/gifts/qr-nova-casa.svg",
  },
];

/** Organism `GiftListSection` — exibida ao convidado após a confirmação de presença. */
export function GiftListSection() {
  return (
    <section id="presentes" className="mx-auto max-w-4xl px-6 py-section-gap">
      <Heading className="text-center">Lista de presentes</Heading>
      <Text tone="secondary" className="mx-auto mt-4 max-w-xl text-center">
        Sua presença já é o maior presente. Se quiser nos ajudar a começar essa nova fase, aqui estão algumas
        formas via Pix — sem nenhum compromisso.
      </Text>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {GIFTS.map((gift) => (
          <GiftCard key={gift.title} {...gift} />
        ))}
      </div>
    </section>
  );
}
