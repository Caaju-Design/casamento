import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary, localeInfo, type Locale } from "@/lib/i18n/dictionaries";

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

type Props = { searchParams: Promise<{ corte?: string; lang?: string }> };

export default async function GiftListPage({ searchParams }: Props) {
  const { corte, lang } = await searchParams;
  const locale: Locale = lang === "en" || lang === "ar" ? lang : "pt";
  const t = getDictionary(locale).gift;
  const info = localeInfo(locale);
  const custom = Number.parseInt(corte ?? "", 10);
  const override = Number.isFinite(custom) ? Math.min(300, Math.max(0, custom)) : null;
  const cropMobile = override ?? DEFAULT_CROP_MOBILE;
  const cropDesktop = override ?? DEFAULT_CROP_DESKTOP;

  return (
    <main lang={info.lang} dir={info.dir} className="flex h-[100svh] flex-col bg-page">
      <header className="relative z-10 grid h-[72px] shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 bg-white px-4 shadow-[0_10px_30px_-24px_rgba(45,43,35,0.45)] md:px-6">
        <Link
          href={`${info.href}#presentes`}
          className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 justify-self-start font-body text-100 uppercase tracking-[0.18em] text-text-primary hover:text-terracota-700"
        >
          <span aria-hidden="true" className="text-200 rtl:-scale-x-100">←</span> <span className="sr-only sm:not-sr-only">{t.back}</span>
        </Link>
        {/* no centro, só a logo do casal (igual ao menu do site); o título fica pra leitor de tela */}
        <h1 className="justify-self-center">
          <span className="sr-only">{t.pageTitle}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-ge.svg" alt="" width={470} height={401} className="h-11 w-auto" />
        </h1>
        <a
          href={LIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.newTabLabel}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-end gap-1 justify-self-end whitespace-nowrap font-body text-100 uppercase tracking-[0.12em] text-text-secondary hover:text-terracota-700"
        >
          <span className="hidden sm:inline">{t.newTab}</span>
          <span aria-hidden="true" className="text-200">↗</span>
        </a>
      </header>

      <div
        className="gift-frame relative isolate flex-1 overflow-hidden"
        style={{ ["--crop-m" as string]: `${cropMobile}px`, ["--crop-d" as string]: `${cropDesktop}px` }}
      >
        <iframe
          src={LIST_URL}
          title={t.iframeTitle}
          allow="payment; clipboard-write"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-x-0 w-full border-0"
        />
        <p className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 p-6 text-center font-body text-100 text-text-secondary">
          {t.fallback}
        </p>
      </div>
    </main>
  );
}
