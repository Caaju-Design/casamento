import Link from "next/link";
import { localeInfo, type Locale } from "@/lib/i18n/dictionaries";

/**
 * Template `EmbeddedPageTemplate` — página "janela" pra um endereço do site
 * da assessoria (gabrielaemanuel.com.br) dentro do nosso: cabeçalho branco
 * com Voltar (só a seta no celular), logo do casal no centro e "Abrir em
 * outra aba" à direita; embaixo, o iframe ocupando o resto da tela.
 * Usado pela Lista de presentes (/presentes) e pela Confirmação de presença
 * (/confirmacao-de-presenca).
 *
 * Os `crop` px do topo do iframe ficam escondidos: é o cabeçalho do site da
 * assessoria ("G&E por TR Assessoria…" + menu). Não dá pra esconder por CSS
 * (é outro domínio, o navegador não deixa), então a janela é "recortada": o
 * iframe sobe esse tanto dentro de um contêiner com overflow escondido.
 */
export function EmbeddedPageTemplate({
  locale,
  src,
  backHref,
  crop,
  labels,
}: {
  locale: Locale;
  src: string;
  /** Pra onde o Voltar leva, ex. "#presentes" (âncora da home no idioma certo). */
  backHref: string;
  crop: { mobile: number; desktop: number };
  labels: { pageTitle: string; back: string; newTab: string; newTabLabel: string; fallback: string; iframeTitle: string };
}) {
  const info = localeInfo(locale);
  return (
    <main lang={info.lang} dir={info.dir} className="flex h-[100svh] flex-col bg-page">
      <header className="relative z-10 grid h-[72px] shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 bg-white px-4 shadow-[0_10px_30px_-24px_rgba(45,43,35,0.45)] md:px-6">
        <Link
          href={`${info.href}${backHref}`}
          className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 justify-self-start font-body text-100 uppercase tracking-[0.18em] text-text-primary hover:text-terracota-700"
        >
          <span aria-hidden="true" className="text-200 rtl:-scale-x-100">←</span> <span className="sr-only sm:not-sr-only">{labels.back}</span>
        </Link>
        {/* no centro, só a logo do casal (igual ao menu do site); o título fica pra leitor de tela */}
        <h1 className="justify-self-center">
          <span className="sr-only">{labels.pageTitle}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-ge.svg" alt="" width={470} height={401} className="h-11 w-auto" />
        </h1>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={labels.newTabLabel}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-end gap-1 justify-self-end whitespace-nowrap font-body text-100 uppercase tracking-[0.12em] text-text-secondary hover:text-terracota-700"
        >
          <span className="hidden sm:inline">{labels.newTab}</span>
          <span aria-hidden="true" className="text-200">↗</span>
        </a>
      </header>

      <div
        className="gift-frame relative isolate flex-1 overflow-hidden"
        style={{ ["--crop-m" as string]: `${crop.mobile}px`, ["--crop-d" as string]: `${crop.desktop}px` }}
      >
        <iframe
          src={src}
          title={labels.iframeTitle}
          allow="payment; clipboard-write"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-x-0 w-full border-0"
        />
        <p className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 p-6 text-center font-body text-100 text-text-secondary">
          {labels.fallback}
        </p>
      </div>
    </main>
  );
}

/** Lê `?corte=` (0 a 300) pra calibrar o recorte sem publicar de novo. */
export function cropFromParam(corte: string | undefined, fallback: { mobile: number; desktop: number }) {
  const custom = Number.parseInt(corte ?? "", 10);
  if (!Number.isFinite(custom)) return fallback;
  const v = Math.min(300, Math.max(0, custom));
  return { mobile: v, desktop: v };
}
