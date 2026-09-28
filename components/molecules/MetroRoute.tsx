"use client";

import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
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
 * estações, mas limpo: um trilho vertical PINTADO em aquarela (pincelada
 * com a mesma receita do círculo do calendário) na cor de cada linha, com TODAS
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

/** Uma linha do diagrama: coluna do trilho (só o nó; a tinta é desenhada por baixo, num SVG só) + conteúdo. */
function Row({ node, nodeRef, children, className = "" }: { node: ReactNode; nodeRef?: RefObject<HTMLSpanElement | null>; children: ReactNode; className?: string }) {
  return (
    <li className="relative flex items-stretch gap-4">
      <span aria-hidden="true" className="relative flex w-10 shrink-0 items-center justify-center">
        <span ref={nodeRef} className="relative z-10 flex items-center">
          {node}
        </span>
      </span>
      <div className={["min-w-0 flex-1 self-center", className].join(" ")}>{children}</div>
    </li>
  );
}

/* ── tinta ────────────────────────────────────────────────────────────── */

/** Ruído determinístico (mesmo desenho no servidor e no navegador). */
function rand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** Pincelada vertical de y0 a y1 em x, levemente torta (curvas suaves a cada ~70px). */
function strokePath(x: number, y0: number, y1: number, seed: number, amp: number) {
  const n = Math.max(2, Math.round((y1 - y0) / 70));
  let d = `M${(x + (rand(seed) - 0.5) * amp).toFixed(1)} ${y0.toFixed(1)}`;
  for (let i = 1; i <= n; i++) {
    const y = y0 + ((y1 - y0) * i) / n;
    const yc = y - (y1 - y0) / n / 2;
    const xc = x + (rand(seed + i * 3.1) - 0.5) * amp * 2;
    const xe = x + (rand(seed + i * 7.7) - 0.5) * amp;
    d += ` Q${xc.toFixed(1)} ${yc.toFixed(1)} ${xe.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}

/**
 * Uma "linha de metrô" pintada: mancha clara que vaza (borrada), passada
 * principal e duas passadas finas deslocadas — mesma receita do círculo do
 * calendário (`brush-rough`): contorno ondulado + falhas de tinta seca.
 */
function InkLine({ x, y0, y1, color, seed }: { x: number; y0: number; y1: number; color: string; seed: number }) {
  if (y1 - y0 < 4) return null;
  return (
    <g stroke={color} fill="none" strokeLinecap="round">
      {/* água que vaza em volta */}
      <path d={strokePath(x, y0 - 4, y1 + 4, seed, 3)} strokeWidth={26} strokeOpacity={0.13} filter="url(#metro-bleed)" />
      {/* corpo da pincelada: tinta rala, granulada e arrastada */}
      <path d={strokePath(x, y0, y1, seed + 1, 2)} strokeWidth={13} strokeOpacity={0.5} filter="url(#metro-wash)" />
      <path d={strokePath(x + 1.5, y0 + 8, y1 - 6, seed + 2, 2.6)} strokeWidth={6} strokeOpacity={0.35} filter="url(#metro-wash)" />
      {/* bordas mais escuras, onde o pigmento acumula quando a água seca */}
      <g filter="url(#metro-brush)">
        <path d={strokePath(x - 5.5, y0 + 3, y1 - 3, seed + 1, 2)} strokeWidth={1.7} strokeOpacity={0.6} />
        <path d={strokePath(x + 5.5, y0 + 5, y1 - 2, seed + 1, 2)} strokeWidth={1.4} strokeOpacity={0.5} />
      </g>
    </g>
  );
}

/** Papel (miolo branco das bolinhas), com a borda levemente irregular. */
const PAPER = "#fbfaf6";

/** Anel pintado: miolo de papel + aro de tinta rala com a borda mais escura. */
function PaintRing({ cx, cy, r, width, color }: { cx: number; cy: number; r: number; width: number; color: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + width / 2} fill={color} fillOpacity={0.12} filter="url(#metro-bleed)" />
      <circle cx={cx} cy={cy} r={r + width / 2} fill={PAPER} filter="url(#metro-paper)" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={width} strokeOpacity={0.72} filter="url(#metro-dab)" />
      <circle cx={cx} cy={cy} r={r + width / 2 - 0.6} fill="none" stroke={color} strokeWidth={1.1} strokeOpacity={0.55} filter="url(#metro-dab)" />
    </g>
  );
}

type Geo = { w: number; h: number; x: number; start: number; transfer: number; end: number; car: number; dots: { y: number; color: string }[] };

function useGeo(box: RefObject<HTMLOListElement | null>, refs: RefObject<HTMLSpanElement | null>[]) {
  const [geo, setGeo] = useState<Geo | null>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const c = refs.map((ref) => {
        const n = ref.current?.getBoundingClientRect();
        return n ? { x: n.left + n.width / 2 - r.left, y: n.top + n.height / 2 - r.top } : { x: 0, y: 0 };
      });
      const [a, b, e, car] = c as [(typeof c)[0], (typeof c)[0], (typeof c)[0], (typeof c)[0]];
      const dots = [...el.querySelectorAll<HTMLElement>("[data-metro-dot]")].map((d) => {
        const n = d.getBoundingClientRect();
        return { y: n.top + n.height / 2 - r.top, color: d.dataset.metroDot ?? L1 };
      });
      setGeo({ w: r.width, h: r.height, x: a.x, start: a.y, transfer: b.y, end: e.y, car: car.y, dots });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return geo;
}

function Ink({ geo }: { geo: Geo }) {
  const { w, h, x } = geo;
  return (
    <svg aria-hidden="true" width={w} height={h} className="pointer-events-none absolute inset-0 overflow-visible">
      <defs>
        {/* contorno ondulado (ruído grosso) + tinta seca arrastada no sentido da pincelada (ruído fino esticado na vertical) */}
        <filter id="metro-brush" filterUnits="userSpaceOnUse" x={-20} y={-20} width={w + 40} height={h + 40}>
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="wob" />
          <feDisplacementMap in="SourceGraphic" in2="wob" scale="5" result="shape" />
          <feTurbulence type="fractalNoise" baseFrequency="0.7 0.05" numOctaves="2" seed="9" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.75" result="dry" />
          <feComposite in="shape" in2="dry" operator="in" />
        </filter>
        {/* corpo: ondulado + pigmento granulado em faixas verticais (a tinta falha e acumula no sentido do pincel) */}
        <filter id="metro-wash" filterUnits="userSpaceOnUse" x={-30} y={-30} width={w + 60} height={h + 60}>
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="wob" />
          <feDisplacementMap in="SourceGraphic" in2="wob" scale="7" result="shape" />
          <feTurbulence type="fractalNoise" baseFrequency="0.3 0.035" numOctaves="3" seed="21" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.35" result="pig" />
          <feComposite in="shape" in2="pig" operator="in" />
        </filter>
        {/* bolinhas: ondulado bem leve (círculo pequeno deforma fácil) + granulado suave */}
        <filter id="metro-dab" filterUnits="userSpaceOnUse" x={-30} y={-30} width={w + 60} height={h + 60}>
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="6" result="wob" />
          <feDisplacementMap in="SourceGraphic" in2="wob" scale="2.6" result="shape" />
          <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="2" seed="13" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.3" result="pig" />
          <feComposite in="shape" in2="pig" operator="in" />
        </filter>
        {/* papel: só o contorno levemente irregular, sem granulado (tampa a linha por baixo) */}
        <filter id="metro-paper" filterUnits="userSpaceOnUse" x={-30} y={-30} width={w + 60} height={h + 60}>
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="6" result="wob" />
          <feDisplacementMap in="SourceGraphic" in2="wob" scale="2.6" />
        </filter>
        {/* água que vaza em volta da pincelada */}
        <filter id="metro-bleed" filterUnits="userSpaceOnUse" x={-30} y={-30} width={w + 60} height={h + 60}>
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="2" result="wob" />
          <feDisplacementMap in="SourceGraphic" in2="wob" scale="14" result="d" />
          <feGaussianBlur in="d" stdDeviation="3" />
        </filter>
      </defs>
      <InkLine x={x} y0={geo.start} y1={geo.transfer} color={L1} seed={11} />
      <InkLine x={x} y0={geo.transfer} y1={geo.end} color={L5} seed={37} />
      {/* estações do caminho */}
      {geo.dots.map((d, i) => (
        <PaintRing key={i} cx={x} cy={d.y} r={5.2} width={3} color={d.color} />
      ))}
      {/* embarque e desembarque: aros grandes; no desembarque, um pingo de tinta no meio */}
      <PaintRing cx={x} cy={geo.start} r={13.5} width={6} color={L1} />
      <PaintRing cx={x} cy={geo.end} r={13.5} width={6} color={L5} />
      <circle cx={x} cy={geo.end} r={5} fill={L5} fillOpacity={0.8} filter="url(#metro-dab)" />
      {/* baldeação: disco meio azul, meio lilás, com o miolo de papel (a setinha fica por cima, em HTML) */}
      <circle cx={x} cy={geo.transfer} r={19} fill={PAPER} filter="url(#metro-paper)" />
      <g filter="url(#metro-dab)">
        <path d={`M${x - 19} ${geo.transfer} A19 19 0 0 1 ${x + 19} ${geo.transfer} Z`} fill={L1} fillOpacity={0.78} />
        <path d={`M${x + 19} ${geo.transfer} A19 19 0 0 1 ${x - 19} ${geo.transfer} Z`} fill={L5} fillOpacity={0.78} />
      </g>
      <circle cx={x} cy={geo.transfer} r={11.5} fill={PAPER} filter="url(#metro-paper)" />
      <circle cx={x} cy={geo.transfer} r={21} fill="none" stroke={L5} strokeOpacity={0.1} strokeWidth={6} filter="url(#metro-bleed)" />
      {/* do desembarque até o carro: pontinhos de pincel caramelo */}
      <path
        d={`M${x} ${geo.end + 22} L${x} ${geo.car - 20}`}
        stroke={RIDE}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray="0.1 9"
        filter="url(#metro-brush)"
      />
    </svg>
  );
}

/** Lugar da bolinha da estação (a bolinha é pintada no SVG por baixo). */
const dot = (color: string) => <span data-metro-dot={color} className="block h-3 w-3" />;

/** Lugar dos aros grandes (pintados no SVG). */
function Big() {
  return <span className="block h-9 w-9" />;
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
    <Row key={n} node={dot(color)} className="py-[3px]">
      <span className="font-body text-100 leading-tight text-text-secondary">{n}</span>
    </Row>
  ));
}

export function MetroRoute({ t }: { t: Dictionary["stay"]["metro"] }) {
  const n1 = METRO_L1_STOPS.length + 1; // estações andadas até a baldeação
  const n5 = METRO_L5_STOPS.length + 1;
  const major = "font-body text-200 font-bold leading-tight text-text-primary";
  const sub = "mt-0.5 font-body text-100 leading-tight text-text-secondary";
  const box = useRef<HTMLOListElement>(null);
  const rStart = useRef<HTMLSpanElement>(null);
  const rTransfer = useRef<HTMLSpanElement>(null);
  const rEnd = useRef<HTMLSpanElement>(null);
  const rCar = useRef<HTMLSpanElement>(null);
  const geo = useGeo(box, [rStart, rTransfer, rEnd, rCar]);

  return (
    <figure aria-label={t.mapLabel} className="rounded-[1.25rem] bg-white/70 px-4 py-5 sm:px-6">
      <div className="relative">
        {geo && <Ink geo={geo} />}
        <ol ref={box} className="relative">
        {/* embarque */}
        <Row nodeRef={rStart} node={<Big />} className="pb-1">
          <Badge color="#984b2c">{t.board}</Badge>
          <p className={`${major} mt-1`}>{METRO_START}</p>
          <p className={sub}>{t.boardSub}</p>
        </Row>
        <Row node={null}>
          <LineLabel color={L1} name={t.line1} toward={`${t.toward} ${METRO_LINES.l1.toward}`} stops={t.stops.replace("{n}", String(n1))} />
        </Row>
        <Minor names={METRO_L1_STOPS} color={L1} />

        {/* baldeação: bolinha meio azul, meio lilás */}
        <Row
          nodeRef={rTransfer}
          className="py-2"
          node={
            <span className="flex h-10 w-10 items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#2d2b23" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 4v13m0 0-3-3m3 3 3-3M17 20V7m0 0-3 3m3-3 3 3" />
              </svg>
            </span>
          }
        >
          <Badge color="#984b2c">{t.transfer}</Badge>
          <p className={`${major} mt-1`}>{METRO_TRANSFER}</p>
          <p className={sub}>{t.transferSub}</p>
        </Row>
        <Row node={null}>
          <LineLabel color={L5} name={t.line5} toward={`${t.toward} ${METRO_LINES.l5.toward}`} stops={t.stops.replace("{n}", String(n5))} />
        </Row>
        <Minor names={METRO_L5_STOPS} color={L5} />

        {/* desembarque */}
        <Row nodeRef={rEnd} node={<Big />} className="py-2">
          <Badge color="#984b2c">{t.getOff}</Badge>
          <p className={`${major} mt-1`}>{METRO_END}</p>
          <p className={sub}>{t.getOffSub}</p>
        </Row>

        {/* Uber / 99 */}
        <Row
          nodeRef={rCar}
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
      </div>
    </figure>
  );
}
