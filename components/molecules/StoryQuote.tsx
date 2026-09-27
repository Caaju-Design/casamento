import type { ReactNode } from "react";

/**
 * Molecule `StoryQuote` — moldura dos textos dos capítulos da Nossa história:
 * SEM cartão (pedido do Manu), só ASPAS grandes — abrindo em cima, fechando
 * embaixo — e, por trás, aquarela bem sutil no estilo das nuvens do site
 * (as nuvens pêssego recoloridas). Dois tons (`tone`), e as aspas seguem a
 * cor da nuvem no mesmo tom:
 *  - "azul": nuvens ardósia (`public/decor/nuvens-azuis`), aspas ardósia.500;
 *  - "oliva": nuvens sálvia/oliva (`public/decor/nuvens-oliva`), aspas salvia.700.
 *
 * Nuvens e aspas ficam PARADAS no lugar; só o texto (children) entra com o
 * efeito de surgir — quem chama embrulha o texto em `PaintReveal`.
 *
 * As aspas são SVG com um leve "tremido" de pincel (mesmo filtro do círculo
 * do calendário). Posições lógicas (start/end): em árabe tudo espelha.
 * Só decoração: aspas e manchas são `aria-hidden`.
 */


/** Um glifo de aspa "6": bolinha com a cauda subindo pra direita. */
const GLYPH = "M2 28 A10 10 0 1 0 14.5 18.3 C15.2 13.2 18.4 9.2 23.5 6.6 L21.4 2.8 C10.2 7.6 2 16.4 2 28 Z";

function Quote({ className, color }: { className: string; color: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 50 40" className={["pointer-events-none absolute", className].join(" ")}>
      <defs>
        <filter id="quote-rough" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
        </filter>
      </defs>
      <g fill={color} fillOpacity={0.9} filter="url(#quote-rough)">
        <path d={GLYPH} />
        <path d={GLYPH} transform="translate(25 0)" />
      </g>
    </svg>
  );
}

export type StoryQuoteTone = "azul" | "oliva";

const TONES: Record<StoryQuoteTone, { quote: string; top: string; bottom: string }> = {
  azul: { quote: "#6e8da2", top: "/decor/nuvens-azuis/a8.webp", bottom: "/decor/nuvens-azuis/a4.webp" },
  oliva: { quote: "#848169", top: "/decor/nuvens-oliva/o8.webp", bottom: "/decor/nuvens-oliva/o4.webp" },
};

export function StoryQuote({ children, tone = "azul" }: { children: ReactNode; tone?: StoryQuoteTone }) {
  const c = TONES[tone];
  return (
    <div className="relative isolate px-2 pb-14 pt-14 md:px-4 md:pb-16 md:pt-16">
      {/* aquarela bem sutil, no mesmo estilo das nuvens do site */}
      {/* eslint-disable @next/next/no-img-element */}
      <img
        src={c.top}
        alt=""
        aria-hidden="true"
        width={865}
        height={297}
        className="pointer-events-none absolute -start-10 top-0 -z-10 w-[85%] select-none opacity-60 mix-blend-multiply rtl:-scale-x-100 md:-start-16"
      />
      <img
        src={c.bottom}
        alt=""
        aria-hidden="true"
        width={808}
        height={434}
        className="pointer-events-none absolute -end-10 bottom-0 -z-10 w-[70%] -scale-x-100 select-none opacity-50 mix-blend-multiply rtl:scale-x-100 md:-end-16"
      />
      {/* eslint-enable @next/next/no-img-element */}

      {/* aspas na cor da nuvem: abrindo em cima, fechando embaixo (girada) */}
      <Quote color={c.quote} className="start-0 top-2 h-10 w-12 rtl:-scale-x-100 md:h-14 md:w-[4.2rem]" />
      <Quote color={c.quote} className="bottom-2 end-0 h-10 w-12 rotate-180 rtl:-scale-x-100 md:h-14 md:w-[4.2rem]" />
      {children}
    </div>
  );
}
