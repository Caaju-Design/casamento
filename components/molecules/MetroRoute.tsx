import type { CSSProperties, ReactNode } from "react";
import {
  METRO_END,
  METRO_L1_STOPS,
  METRO_L5_STOPS,
  METRO_LINES,
  METRO_START,
  METRO_TRANSFER,
} from "@/lib/content/metro";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Molecule `MetroRoute` — o trajeto de metrô da Rodoviária do Tietê até o
 * Alto da Boa Vista, redesenhado no estilo dos "mapas de embarque" das
 * estações, mas limpo: um trilho vertical na cor de cada linha, com TODAS
 * as estações do caminho (dá pra ir contando), e as três paradas que
 * importam em destaque — Embarque (Tietê), Baldeação (Santa Cruz, bolinha
 * meio azul, meio lilás) e Desça aqui (Alto da Boa Vista). No fim, um
 * tracejado até o carro (Uber/99).
 *
 * Feito em HTML (não SVG) pra quebrar linha, traduzir e espelhar no árabe.
 */

const L1 = METRO_LINES.l1.color;
const L5 = METRO_LINES.l5.color;
const RIDE = "#c9a88a"; // caramelo do tracejado final

type Seg = string | null | "dash";

/** Uma linha do diagrama: trilho à esquerda (metade de cima / de baixo) + conteúdo. */
function Row({ top, bottom, node, children, className = "" }: { top: Seg; bottom: Seg; node: ReactNode; children: ReactNode; className?: string }) {
  const seg = (c: Seg, pos: "top" | "bottom"): CSSProperties | null =>
    c === null
      ? null
      : c === "dash"
        ? { [pos]: 0, height: "50%", backgroundImage: `repeating-linear-gradient(to bottom, ${RIDE} 0 5px, transparent 5px 10px)` }
        : { [pos]: 0, height: "50%", background: c };
  const t = seg(top, "top");
  const b = seg(bottom, "bottom");
  return (
    <li className="relative flex items-stretch gap-4">
      <span aria-hidden="true" className="relative flex w-10 shrink-0 justify-center self-stretch">
        {t && <span className="absolute w-[6px] rounded-none" style={t} />}
        {b && <span className="absolute w-[6px]" style={b} />}
        <span className="relative z-10 flex items-center">{node}</span>
      </span>
      <div className={["min-w-0 flex-1 self-center", className].join(" ")}>{children}</div>
    </li>
  );
}

const dot = (color: string) => (
  <span className="block h-3 w-3 rounded-full border-[2.5px] bg-white" style={{ borderColor: color }} />
);

function Big({ ring, children }: { ring: string; children?: ReactNode }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_-6px_rgba(45,43,35,0.6)]" style={{ boxShadow: `inset 0 0 0 5px ${ring}` }}>
      {children}
    </span>
  );
}

function Badge({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span className="inline-block rounded-pill px-2.5 py-0.5 font-body text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white" style={{ background: color }}>
      {children}
    </span>
  );
}

function LineLabel({ color, name, toward, stops }: { color: string; name: string; toward: string; stops: string }) {
  return (
    <div className="py-2.5 font-body text-100 leading-tight">
      <span className="inline-block rounded-[0.4rem] px-2 py-1 font-bold text-white" style={{ background: color }}>
        {name}
      </span>
      <p className="mt-1.5 text-text-primary">
        {toward} <span className="text-text-secondary">· {stops}</span>
      </p>
    </div>
  );
}

function Minor({ names, color }: { names: string[]; color: string }) {
  return names.map((n) => (
    <Row key={n} top={color} bottom={color} node={dot(color)} className="py-[3px]">
      <span className="font-body text-100 leading-tight text-text-secondary">{n}</span>
    </Row>
  ));
}

export function MetroRoute({ t }: { t: Dictionary["stay"]["metro"] }) {
  const n1 = METRO_L1_STOPS.length + 1; // estações andadas até a baldeação
  const n5 = METRO_L5_STOPS.length + 1;
  const major = "font-body text-200 font-bold leading-tight text-text-primary";
  const sub = "mt-0.5 font-body text-100 leading-tight text-text-secondary";

  return (
    <figure aria-label={t.mapLabel} className="rounded-[1.25rem] bg-white/70 px-4 py-5 sm:px-6">
      <ol>
        {/* embarque */}
        <Row top={null} bottom={L1} node={<Big ring={L1} />} className="pb-1">
          <Badge color="#984b2c">{t.board}</Badge>
          <p className={`${major} mt-1`}>{METRO_START}</p>
          <p className={sub}>{t.boardSub}</p>
        </Row>
        <Row top={L1} bottom={L1} node={null}>
          <LineLabel color={L1} name={t.line1} toward={`${t.toward} ${METRO_LINES.l1.toward}`} stops={t.stops.replace("{n}", String(n1))} />
        </Row>
        <Minor names={METRO_L1_STOPS} color={L1} />

        {/* baldeação: bolinha meio azul, meio lilás */}
        <Row
          top={L1}
          bottom={L5}
          className="py-2"
          node={
            <span className="flex h-10 w-10 items-center justify-center rounded-full shadow-[0_4px_12px_-6px_rgba(45,43,35,0.6)]" style={{ background: `linear-gradient(180deg, ${L1} 50%, ${L5} 50%)` }}>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#2d2b23" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 4v13m0 0-3-3m3 3 3-3M17 20V7m0 0-3 3m3-3 3 3" />
                </svg>
              </span>
            </span>
          }
        >
          <Badge color="#984b2c">{t.transfer}</Badge>
          <p className={`${major} mt-1`}>{METRO_TRANSFER}</p>
          <p className={sub}>{t.transferSub}</p>
        </Row>
        <Row top={L5} bottom={L5} node={null}>
          <LineLabel color={L5} name={t.line5} toward={`${t.toward} ${METRO_LINES.l5.toward}`} stops={t.stops.replace("{n}", String(n5))} />
        </Row>
        <Minor names={METRO_L5_STOPS} color={L5} />

        {/* desembarque */}
        <Row top={L5} bottom="dash" node={<Big ring={L5}><span className="h-2.5 w-2.5 rounded-full" style={{ background: L5 }} /></Big>} className="py-2">
          <Badge color="#984b2c">{t.getOff}</Badge>
          <p className={`${major} mt-1`}>{METRO_END}</p>
          <p className={sub}>{t.getOffSub}</p>
        </Row>

        {/* Uber / 99 */}
        <Row
          top="dash"
          bottom={null}
          className="pt-2"
          node={
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-page text-terracota-700 shadow-[0_4px_12px_-6px_rgba(152,75,44,0.7)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 16V11.5L7 6.8A2 2 0 0 1 8.8 5.6h6.4A2 2 0 0 1 17 6.8l2 4.7V16" />
                <path d="M3.5 16h17M4.5 11.5h15" />
                <circle cx="7.5" cy="16.5" r="1.7" />
                <circle cx="16.5" cy="16.5" r="1.7" />
              </svg>
            </span>
          }
        >
          <p className="font-body text-200 leading-tight text-text-primary">{t.ride}</p>
        </Row>
      </ol>
    </figure>
  );
}
