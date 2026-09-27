import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lista de presentes — Gabriela & Emanuel",
  description: "Presenteie os noivos: a lista de presentes de Gabriela & Emanuel.",
};

/** Endereço da lista (site da assessoria). */
const LIST_URL = "https://www.gabrielaemanuel.com.br/lista-de-presentes";

/**
 * Quantos px do topo da lista ficam escondidos: é o cabeçalho do site da
 * assessoria ("G&E por TR Assessoria…" + menu). Não dá pra esconder por
 * CSS (é outro domínio — o navegador não deixa), então a janela é
 * "recortada": o iframe sobe esse tanto dentro de um contêiner com
 * overflow escondido. Como o cabeçalho deles fica no topo da janela, ele
 * continua escondido mesmo rolando.
 * Pra calibrar sem publicar de novo: /presentes?corte=90 (0 a 300).
 */
const DEFAULT_CROP_MOBILE = 64;
const DEFAULT_CROP_DESKTOP = 64;

type Props = { searchParams: Promise<{ corte?: string }> };

export default async function GiftListPage({ searchParams }: Props) {
  const { corte } = await searchParams;
  const custom = Number.parseInt(corte ?? "", 10);
  const override = Number.isFinite(custom) ? Math.min(300, Math.max(0, custom)) : null;
  const cropMobile = override ?? DEFAULT_CROP_MOBILE;
  const cropDesktop = override ?? DEFAULT_CROP_DESKTOP;

  return (
    <main className="flex h-[100svh] flex-col bg-page">
      <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-caramelo-100 bg-page px-4 md:px-6">
        <Link
          href="/#presentes"
          className="inline-flex min-h-[44px] items-center gap-2 font-body text-100 uppercase tracking-[0.18em] text-text-primary hover:text-terracota-700"
        >
          <span aria-hidden="true">←</span> Voltar
        </Link>
        <h1 className="truncate font-display text-400 leading-none text-text-primary sm:text-600">Lista de presentes</h1>
        <a
          href={LIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir a lista em outra aba"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-end gap-1 whitespace-nowrap font-body text-100 uppercase tracking-[0.12em] text-text-secondary hover:text-terracota-700"
        >
          <span className="hidden sm:inline">Abrir em outra aba</span>
          <span aria-hidden="true" className="text-200">↗</span>
        </a>
      </header>

      <div
        className="gift-frame relative isolate flex-1 overflow-hidden"
        style={{ ["--crop-m" as string]: `${cropMobile}px`, ["--crop-d" as string]: `${cropDesktop}px` }}
      >
        <iframe
          src={LIST_URL}
          title="Lista de presentes de Gabriela & Emanuel"
          allow="payment; clipboard-write"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-x-0 w-full border-0"
        />
        <p className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 p-6 text-center font-body text-100 text-text-secondary">
          Se a lista não aparecer, use “Abrir em outra aba” lá em cima.
        </p>
      </div>
    </main>
  );
}
