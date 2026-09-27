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

const INTL: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
  ar: "ar-u-nu-latn",
};

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
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.035"
            numOctaves="2"
            seed="3"
            result="wob"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="wob"
            scale="5"
            result="shape"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9 0.22"
            numOctaves="2"
            seed="11"
            result="grain"
          />
          <feColorMatrix
            in="grain"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.8"
            result="dry"
          />
          <feComposite in="shape" in2="dry" operator="in" />
        </filter>
      </defs>
      <g
        fill="none"
        stroke="#bc6316"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#brush-rough)"
      >
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

/**
 * Argolas de encadernação pintadas em aquarela (tom caramelo/dourado), vistas
 * UM POUCO DE LADO (pedido do Manu, ref. de caderno espiral): cada argola sai
 * do furo na frente da folha, dá a volta por cima e desce POR TRÁS da borda.
 * Camadas: sombra na folha, lavagem larga, traço principal e brilho fino,
 * com o mesmo "tremido" de pincel. A linha y=28 do viewBox é a borda da folha.
 */
function Ring() {
  const loop = "M9 35 C2.5 27 3 11.5 13.5 9 C22.5 7 26.5 17.5 23 28";
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 30 44"
      className="h-12 w-[2.1rem] overflow-visible"
    >
      {/* furo e sombra da argola na folha */}
      <ellipse
        cx="9.5"
        cy="35.5"
        rx="3.6"
        ry="2.4"
        fill="#614431"
        fillOpacity={0.5}
        filter="url(#ring-soft)"
      />
      <path
        d="M11 36 C14 34 19 31 24 29"
        stroke="#3a3834"
        strokeOpacity={0.12}
        strokeWidth={2.4}
        fill="none"
        filter="url(#ring-soft)"
      />
      <g fill="none" strokeLinecap="round" filter="url(#ring-rough)">
        <path
          d={loop}
          stroke="#cd9e80"
          strokeOpacity={0.45}
          strokeWidth={6.5}
        />
        <path d={loop} stroke="#785a29" strokeOpacity={0.85} strokeWidth={3} />
        <path
          d="M7.4 27 C5.8 20 7.5 13 12.6 11.2"
          stroke="#f8e0b6"
          strokeOpacity={0.9}
          strokeWidth={0.9}
        />
      </g>
    </svg>
  );
}

function Rings() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-7 -top-[30px] z-10 flex justify-between sm:inset-x-9"
    >
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="ring-rough" x="-40%" y="-20%" width="180%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.7"
              numOctaves="2"
              seed="4"
              result="n"
            />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="1.2" />
          </filter>
          <filter id="ring-soft">
            <feGaussianBlur stdDeviation="0.7" />
          </filter>
        </defs>
      </svg>
      {Array.from({ length: 5 }, (_, i) => (
        <Ring key={i} />
      ))}
    </div>
  );
}

/** Tamanho (px) da "orelha" dobrada no canto de baixo da folha. */
const CURL = 52;

/**
 * Orelhinha: o canto de baixo da folha dobrado pra cima, mostrando o verso
 * do papel (degradê linho) com uma sombrinha sobre a folha. A folha tem o
 * canto recortado por `clip-path` e a orelha cobre o corte.
 */
function PageCurl() {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${CURL} ${CURL}`}
      width={CURL}
      height={CURL}
      className="pointer-events-none absolute bottom-0 right-0 z-10 overflow-visible"
    >
      <defs>
        <linearGradient id="curl-back" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#d9cfc0" />
          <stop offset="0.35" stopColor="#fbf8f2" />
          <stop offset="1" stopColor="#ece5da" />
        </linearGradient>
        <filter id="curl-shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow
            dx="-2"
            dy="-1.5"
            stdDeviation="2.2"
            floodColor="#3a3834"
            floodOpacity="0.28"
          />
        </filter>
      </defs>
      <path
        d={`M${CURL} 0 Q30 11 7 7 Q11 30 0 ${CURL} Z`}
        fill="url(#curl-back)"
        stroke="#e6cebf"
        strokeWidth={0.8}
        filter="url(#curl-shadow)"
      />
    </svg>
  );
}

export function WeddingCalendar({
  locale,
  className,
}: {
  locale: Locale;
  className?: string;
}) {
  const intl = INTL[locale];
  const month = cap(
    new Intl.DateTimeFormat(intl, { month: "long", timeZone: "UTC" }).format(
      new Date(Date.UTC(YEAR, MONTH, 1)),
    ),
  );
  // 2027-04-04 é domingo: gera os rótulos de domingo a sábado
  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(intl, {
      weekday: "narrow",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(YEAR, MONTH, 4 + i))),
  );
  const firstWeekday = new Date(Date.UTC(YEAR, MONTH, 1)).getUTCDay();
  const days = new Date(Date.UTC(YEAR, MONTH + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  const fullDate = new Intl.DateTimeFormat(intl, {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(YEAR, MONTH, DAY)));

  return (
    <PaintReveal
      variant="rise"
      delay={120}
      className={["mx-auto w-full", className].filter(Boolean).join(" ")}
    >
      {/* folhinha levemente de lado, com folhas de papel atrás aparecendo */}
      <div className="relative isolate rotate-[2.5deg] rtl:-rotate-[2.5deg]">
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 translate-x-2 translate-y-3 -rotate-[6deg] rounded-card border border-caramelo-100 bg-[#efe9df] shadow-[0_14px_30px_-22px_rgba(45,43,35,0.5)]"
        />
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 -translate-x-1 translate-y-1 rotate-[3.5deg] rounded-card border border-caramelo-100 bg-[#f8f5ef] shadow-[0_10px_24px_-20px_rgba(45,43,35,0.5)]"
        />
        <Rings />
        <div className="drop-shadow-[0_14px_18px_rgba(45,43,35,0.16)]">
          <figure
            aria-label={fullDate}
            className="relative rounded-card border border-caramelo-100 bg-page px-5 pb-6 pt-8 sm:px-7"
            style={{
              clipPath: `polygon(0 0, 100% 0, 100% calc(100% - ${CURL}px), calc(100% - ${CURL}px) 100%, 0 100%)`,
            }}
          >
            <figcaption className="flex items-baseline justify-between border-b border-caramelo-100 pb-3">
              <span
                className="font-display leading-none text-text-title"
                style={{ fontSize: "clamp(2rem, 4vw, 2.6rem)" }}
              >
                {month}
              </span>
              <span className="font-body text-100 tracking-[0.24em] text-text-secondary">
                {YEAR}
              </span>
            </figcaption>

            <div
              aria-hidden="true"
              className="mt-4 grid grid-cols-7 text-center"
            >
              {weekdays.map((w, i) => (
                <span
                  key={i}
                  className="pb-2 font-body text-[0.7rem] uppercase tracking-[0.12em] text-salvia-800 sm:text-100"
                >
                  {w}
                </span>
              ))}
              {cells.map((d, i) => (
                <span
                  key={i}
                  className="relative flex aspect-square items-center justify-center font-body text-200 text-text-primary"
                >
                  {d === DAY ? (
                    <>
                      <BrushCircle />
                      <span className="relative font-bold text-terracota-700">
                        {d}
                      </span>
                    </>
                  ) : (
                    d
                  )}
                </span>
              ))}
            </div>
          </figure>
        </div>
        <PageCurl />
      </div>
    </PaintReveal>
  );
}
