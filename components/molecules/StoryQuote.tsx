import type { ReactNode } from "react";

/**
 * Molecule `StoryQuote` — moldura dos textos dos capítulos da Nossa história,
 * no espírito dos cards de depoimento: um cartão de papel (linho, borda
 * caramelo e sombra macia) com ASPAS grandes na cor dos títulos (#bc6316) —
 * abrindo no canto de cima e fechando no canto de baixo — e duas manchas de
 * aquarela (pêssego e sálvia) escapando por trás dos cantos.
 *
 * As aspas são SVG com um leve "tremido" de pincel (mesmo filtro do círculo
 * do calendário). Posições lógicas (start/end): em árabe tudo espelha.
 * Só decoração: aspas e manchas são `aria-hidden`.
 */

const MANCHA = {
  WebkitMaskImage: "url(/decor/capetown/mancha.webp)",
  maskImage: "url(/decor/capetown/mancha.webp)",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
} as const;

/** Um glifo de aspa "6": bolinha com a cauda subindo pra direita. */
const GLYPH = "M2 28 A10 10 0 1 0 14.5 18.3 C15.2 13.2 18.4 9.2 23.5 6.6 L21.4 2.8 C10.2 7.6 2 16.4 2 28 Z";

function Quote({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 50 40" className={["pointer-events-none absolute", className].join(" ")}>
      <defs>
        <filter id="quote-rough" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="5" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" />
        </filter>
      </defs>
      <g fill="#bc6316" fillOpacity={0.9} filter="url(#quote-rough)">
        <path d={GLYPH} />
        <path d={GLYPH} transform="translate(25 0)" />
      </g>
    </svg>
  );
}

export function StoryQuote({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate">
      {/* manchas de aquarela atrás dos cantos */}
      <span
        aria-hidden="true"
        className="absolute -start-6 -top-7 -z-10 block h-24 w-28 -rotate-12 bg-pessego-100/70 md:-start-10 md:-top-10 md:h-36 md:w-40"
        style={MANCHA}
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-8 -end-6 -z-10 block h-24 w-32 rotate-6 bg-salvia-100/80 md:-bottom-12 md:-end-10 md:h-40 md:w-44"
        style={MANCHA}
      />

      <div className="relative rounded-[1.75rem] border border-caramelo-100 bg-page/90 px-6 pb-8 pt-9 shadow-[0_22px_48px_-34px_rgba(45,43,35,0.55)] backdrop-blur-[2px] md:px-10 md:pb-11 md:pt-12">
        {/* aspas: abrindo em cima, fechando embaixo (girada) */}
        <Quote className="-top-5 start-5 h-10 w-12 rtl:-scale-x-100 md:-top-7 md:start-8 md:h-14 md:w-[4.2rem]" />
        <Quote className="-bottom-5 end-5 h-10 w-12 rotate-180 rtl:-scale-x-100 md:-bottom-7 md:end-8 md:h-14 md:w-[4.2rem]" />
        {children}
      </div>
    </div>
  );
}
