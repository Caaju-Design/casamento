import { PaintReveal } from "@/components/molecules/PaintReveal";
import type { Locale } from "@/lib/i18n/dictionaries";

/**
 * Molecule `WeddingCalendar` — folhinha de abril de 2027 com o dia 17
 * circulado "no pincel" (traço de tinta #bc6316 que se desenha quando o
 * calendário entra na tela), como marcação à mão num calendário de papel.
 *
 * Nomes do mês e dos dias vêm do `Intl` no idioma da página (em árabe a grade
 * espelha sozinha pelo `dir=rtl`). O traço é SVG com `pathLength=1`: a
 * animação `brush-draw` (globals.css) anima o `stroke-dashoffset` de 1 → 0.
 * Sem JS ou com "reduzir movimento", o círculo já aparece desenhado.
 */

const YEAR = 2027;
const MONTH = 3; // abril (0-based)
const DAY = 17;

const INTL: Record<Locale, string> = { pt: "pt-BR", en: "en-US", ar: "ar-u-nu-latn" };

function cap(s: string) {
  return s.charAt(0).toLocaleUpperCase() + s.slice(1);
}

/** Traço de pincel: laço irregular que passa do ponto de partida, como na caneta. */
function BrushCircle() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="brush-circle pointer-events-none absolute left-1/2 top-1/2 h-[205%] w-[205%] -translate-x-1/2 -translate-y-1/2 overflow-visible"
    >
      <defs>
        {/* pincel: contorno ondulado (ruído grosso) + falhas de tinta seca (ruído fino e esticado) */}
        <filter id="brush-rough" x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="wob" />
          <feDisplacementMap in="SourceGraphic" in2="wob" scale="5" result="shape" />
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.22" numOctaves="2" seed="11" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.8" result="dry" />
          <feComposite in="shape" in2="dry" operator="in" />
        </filter>
      </defs>
      <g fill="none" stroke="#bc6316" strokeLinecap="round" strokeLinejoin="round" filter="url(#brush-rough)">
        {/* passada principal: laço inclinado que cruza o começo, como caneta/pincel à mão */}
        <path
          className="brush-draw"
          pathLength={1}
          strokeWidth={7}
          strokeOpacity={0.85}
          d="M74 13 C52 1 17 9 10 42 C4 76 33 96 62 91 C91 86 99 56 90 31 C82 10 57 4 27 18"
        />
        {/* segunda passada, mais fina e deslocada — dá o arrasto e a variação de largura */}
        <path
          className="brush-draw brush-draw--late"
          pathLength={1}
          strokeWidth={3.2}
          strokeOpacity={0.6}
          d="M71 18 C50 7 20 14 14 45 C9 75 37 92 61 87 C86 82 94 57 86 36"
        />
        <path
          className="brush-draw brush-draw--late"
          pathLength={1}
          strokeWidth={1.6}
          strokeOpacity={0.5}
          d="M76 11 C54 -1 14 7 7 42 C2 78 32 99 63 94"
        />
      </g>
    </svg>
  );
}

export function WeddingCalendar({ locale, className }: { locale: Locale; className?: string }) {
  const intl = INTL[locale];
  const month = cap(new Intl.DateTimeFormat(intl, { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(YEAR, MONTH, 1))));
  // 2027-04-04 é domingo: gera os rótulos de domingo a sábado
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(intl, { weekday: locale === "ar" ? "short" : "narrow", timeZone: "UTC" }).format(new Date(Date.UTC(YEAR, MONTH, 4 + i))),
  );
  const firstWeekday = new Date(Date.UTC(YEAR, MONTH, 1)).getUTCDay();
  const days = new Date(Date.UTC(YEAR, MONTH + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array<null>(firstWeekday).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const fullDate = new Intl.DateTimeFormat(intl, { dateStyle: "full", timeZone: "UTC" }).format(new Date(Date.UTC(YEAR, MONTH, DAY)));

  return (
    <PaintReveal variant="rise" delay={120} className={["mx-auto w-full max-w-sm", className].filter(Boolean).join(" ")}>
      <figure
        aria-label={fullDate}
        className="rounded-card border border-caramelo-100 bg-page/85 px-5 pb-6 pt-5 shadow-[0_18px_40px_-30px_rgba(45,43,35,0.45)] backdrop-blur-[2px] sm:px-7"
      >
        <figcaption className="flex items-baseline justify-between border-b border-caramelo-100 pb-3">
          <span className="font-display leading-none text-text-title" style={{ fontSize: "clamp(2rem, 4vw, 2.6rem)" }}>
            {month}
          </span>
          <span className="font-body text-100 tracking-[0.24em] text-text-secondary">{YEAR}</span>
        </figcaption>

        <div aria-hidden="true" className="mt-4 grid grid-cols-7 text-center">
          {weekdays.map((w, i) => (
            <span key={i} className="pb-2 font-body text-[0.7rem] uppercase tracking-[0.12em] text-salvia-800 sm:text-100">
              {w}
            </span>
          ))}
          {cells.map((d, i) => (
            <span key={i} className="relative flex aspect-square items-center justify-center font-body text-200 text-text-primary">
              {d === DAY ? (
                <>
                  <BrushCircle />
                  <span className="relative font-bold text-terracota-700">{d}</span>
                </>
              ) : (
                d
              )}
            </span>
          ))}
        </div>
      </figure>
    </PaintReveal>
  );
}
