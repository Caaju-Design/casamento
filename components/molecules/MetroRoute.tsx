"use client";

import { Fragment, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { LINE_COLORS, ROUTES, type ArrivalId, type LineId } from "@/lib/content/metro";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Molecule `MetroRoute` — o trajeto de trem/metrô de um ponto de chegada
 * (Congonhas, Guarulhos ou Tietê) até o Alto da Boa Vista, redesenhado no
 * estilo dos "mapas de embarque" das estações, mas PINTADO em aquarela: um
 * trilho vertical na cor de cada linha (pincelada com a mesma receita do
 * círculo do calendário), com TODAS as estações do caminho (dá pra ir
 * contando) e as paradas que importam em destaque — Embarque, Baldeação
 * (disco com as duas cores) e Desça aqui. Antes, um tracejado do terminal
 * (avião/ônibus) até a estação; no fim, um tracejado até o carro (Uber/99).
 *
 * O texto é HTML (quebra linha, traduz, espelha no árabe); a tinta é um SVG
 * só, por baixo, desenhado a partir das posições medidas das bolinhas.
 */

const RIDE = "#c9a88a"; // caramelo dos tracejados (a pé / de carro)

type NodeKind = "origin" | "ring" | "dot" | "transfer" | "end" | "car";

/** Uma linha do diagrama: coluna do trilho (lugar do nó; a tinta vem do SVG) + conteúdo. */
function Row({ kind, c1, c2, node, children, className = "" }: { kind?: NodeKind; c1?: string; c2?: string; node?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <li className="relative flex items-stretch gap-4">
      <span aria-hidden="true" className="relative flex w-10 shrink-0 items-center justify-center">
        {kind && (
          <span data-node={kind} data-c1={c1} data-c2={c2} className="relative z-10 flex items-center">
            {node ?? <span className={kind === "dot" ? "block h-3 w-3" : "block h-9 w-9"} />}
          </span>
        )}
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


/** Papel (miolo branco das bolinhas), com a borda levemente irregular. */
const PAPER = "#fbfaf6";


type MNode = { kind: NodeKind; y: number; c1?: string; c2?: string };
type Geo = { w: number; h: number; x: number; nodes: MNode[] };

function useGeo(box: RefObject<HTMLOListElement | null>, key: string) {
  const [geo, setGeo] = useState<Geo | null>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      let x = 0;
      const nodes = [...el.querySelectorAll<HTMLElement>("[data-node]")].map((n) => {
        const b = n.getBoundingClientRect();
        x = b.left + b.width / 2 - r.left;
        return { kind: n.dataset.node as NodeKind, y: b.top + b.height / 2 - r.top, c1: n.dataset.c1, c2: n.dataset.c2 };
      });
      setGeo({ w: r.width, h: r.height, x, nodes });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [box, key]);
  return geo;
}

const RADIUS: Record<NodeKind, number> = { origin: 18, ring: 17, dot: 6, transfer: 20, end: 17, car: 18 };

/** Cor que SAI de um nó pra baixo ("dash" = tracejado a pé/de carro). */
function downColor(n: MNode): string | null {
  if (n.kind === "origin" || n.kind === "end") return "dash";
  if (n.kind === "transfer") return n.c2 ?? null;
  if (n.kind === "car") return null;
  return n.c1 ?? null;
}

function Ink({ geo, f }: { geo: Geo; f: string }) {
  const { w, h, x, nodes } = geo;
  // junta trechos seguidos da mesma cor numa pincelada só
  const runs: { color: string; a: MNode; b: MNode }[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const c = downColor(nodes[i]!);
    if (!c) continue;
    const last = runs[runs.length - 1];
    if (last && last.color === c && last.b === nodes[i]) last.b = nodes[i + 1]!;
    else runs.push({ color: c, a: nodes[i]!, b: nodes[i + 1]! });
  }
  const lines = runs.filter((r) => r.color !== "dash" && r.b.y - r.a.y >= 4).map((r, i) => ({ ...r, seed: 11 + i * 26 }));
  const dashes = runs.filter((r) => r.color === "dash");
  const rings = nodes
    .filter((n) => n.kind === "dot" || n.kind === "ring" || n.kind === "end")
    .map((n) => ({ y: n.y, c: n.c1!, r: n.kind === "dot" ? 5.2 : 13.5, sw: n.kind === "dot" ? 3 : 6, end: n.kind === "end" }));
  const transfers = nodes.filter((n) => n.kind === "transfer");
  return (
    <svg aria-hidden="true" width={w} height={h} className="pointer-events-none absolute inset-0 overflow-visible">
        <defs>
          {/* contorno ondulado (ruído grosso) + tinta seca arrastada no sentido da pincelada (ruído fino esticado na vertical) */}
          <filter id={`${f}-brush`} filterUnits="userSpaceOnUse" x={x - 48} y={-30} width={96} height={h + 60}>
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="wob" />
            <feDisplacementMap in="SourceGraphic" in2="wob" scale="5" result="shape" />
            <feTurbulence type="fractalNoise" baseFrequency="0.7 0.05" numOctaves="2" seed="9" result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.75" result="dry" />
            <feComposite in="shape" in2="dry" operator="in" />
          </filter>
          {/* corpo: ondulado + pigmento granulado em faixas verticais (a tinta falha e acumula no sentido do pincel) */}
          <filter id={`${f}-wash`} filterUnits="userSpaceOnUse" x={x - 48} y={-30} width={96} height={h + 60}>
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="wob" />
            <feDisplacementMap in="SourceGraphic" in2="wob" scale="7" result="shape" />
            <feTurbulence type="fractalNoise" baseFrequency="0.3 0.035" numOctaves="3" seed="21" result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.35" result="pig" />
            <feComposite in="shape" in2="pig" operator="in" />
          </filter>
          {/* bolinhas: ondulado bem leve (círculo pequeno deforma fácil) + granulado suave */}
          <filter id={`${f}-dab`} filterUnits="userSpaceOnUse" x={x - 48} y={-30} width={96} height={h + 60}>
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="6" result="wob" />
            <feDisplacementMap in="SourceGraphic" in2="wob" scale="2.6" result="shape" />
            <feTurbulence type="fractalNoise" baseFrequency="0.45" numOctaves="2" seed="13" result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.3" result="pig" />
            <feComposite in="shape" in2="pig" operator="in" />
          </filter>
          {/* papel: só o contorno levemente irregular, sem granulado (tampa a linha por baixo) */}
          <filter id={`${f}-paper`} filterUnits="userSpaceOnUse" x={x - 48} y={-30} width={96} height={h + 60}>
            <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="6" result="wob" />
            <feDisplacementMap in="SourceGraphic" in2="wob" scale="2.6" />
          </filter>
          {/* água que vaza em volta da pincelada */}
          <filter id={`${f}-bleed`} filterUnits="userSpaceOnUse" x={x - 48} y={-30} width={96} height={h + 60}>
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="2" result="wob" />
            <feDisplacementMap in="SourceGraphic" in2="wob" scale="14" result="d" />
            <feGaussianBlur in="d" stdDeviation="3" />
          </filter>
        </defs>
      {/*
        Desempenho (celular): cada filtro de aquarela roda UMA vez por camada
        (tudo que usa o mesmo filtro vai num grupo só) e só na faixa do
        trilho (±48px), não no quadro inteiro. Antes eram ~70 filtros, cada um
        sobre a figura toda: o celular pintava aos pedaços e parecia cortado.
      */}
      <g filter={`url(#${f}-bleed)`}>
        {lines.map((r, i) => (
          <path key={i} d={strokePath(x, r.a.y - 4, r.b.y + 4, r.seed, 3)} stroke={r.color} fill="none" strokeLinecap="round" strokeWidth={26} strokeOpacity={0.13} />
        ))}
        {rings.map((n, i) => (
          <circle key={i} cx={x} cy={n.y} r={n.r + n.sw / 2} fill={n.c} fillOpacity={0.12} />
        ))}
        {transfers.map((n, i) => (
          <circle key={i} cx={x} cy={n.y} r={21} fill="none" stroke={n.c2} strokeOpacity={0.1} strokeWidth={6} />
        ))}
      </g>
      <g filter={`url(#${f}-wash)`} fill="none" strokeLinecap="round">
        {lines.map((r, i) => (
          <g key={i} stroke={r.color}>
            <path d={strokePath(x, r.a.y, r.b.y, r.seed + 1, 2)} strokeWidth={13} strokeOpacity={0.5} />
            <path d={strokePath(x + 1.5, r.a.y + 8, r.b.y - 6, r.seed + 2, 2.6)} strokeWidth={6} strokeOpacity={0.35} />
          </g>
        ))}
      </g>
      <g filter={`url(#${f}-brush)`} fill="none" strokeLinecap="round">
        {lines.map((r, i) => (
          <g key={i} stroke={r.color}>
            <path d={strokePath(x - 5.5, r.a.y + 3, r.b.y - 3, r.seed + 1, 2)} strokeWidth={1.7} strokeOpacity={0.6} />
            <path d={strokePath(x + 5.5, r.a.y + 5, r.b.y - 2, r.seed + 1, 2)} strokeWidth={1.4} strokeOpacity={0.5} />
          </g>
        ))}
        {dashes.map((r, i) => (
          <path key={i} d={`M${x} ${r.a.y + RADIUS[r.a.kind] + 6} L${x} ${r.b.y - RADIUS[r.b.kind] - 6}`} stroke={RIDE} strokeWidth={4} strokeDasharray="0.1 9" />
        ))}
      </g>
      <g filter={`url(#${f}-paper)`} fill={PAPER}>
        {rings.map((n, i) => (
          <circle key={i} cx={x} cy={n.y} r={n.r + n.sw / 2} />
        ))}
        {transfers.map((n, i) => (
          <circle key={i} cx={x} cy={n.y} r={19} />
        ))}
      </g>
      <g filter={`url(#${f}-dab)`}>
        {rings.map((n, i) => (
          <g key={i} fill="none" stroke={n.c}>
            <circle cx={x} cy={n.y} r={n.r} strokeWidth={n.sw} strokeOpacity={0.72} />
            <circle cx={x} cy={n.y} r={n.r + n.sw / 2 - 0.6} strokeWidth={1.1} strokeOpacity={0.55} />
            {n.end && <circle cx={x} cy={n.y} r={5} fill={n.c} fillOpacity={0.8} stroke="none" />}
          </g>
        ))}
        {transfers.map((n, i) => (
          <g key={i}>
            <path d={`M${x - 19} ${n.y} A19 19 0 0 1 ${x + 19} ${n.y} Z`} fill={n.c1} fillOpacity={0.78} />
            <path d={`M${x + 19} ${n.y} A19 19 0 0 1 ${x - 19} ${n.y} Z`} fill={n.c2} fillOpacity={0.78} />
          </g>
        ))}
      </g>
      <g filter={`url(#${f}-paper)`} fill={PAPER}>
        {transfers.map((n, i) => (
          <circle key={i} cx={x} cy={n.y} r={11.5} />
        ))}
      </g>
    </svg>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-pill bg-terracota-500 px-2.5 py-0.5 font-body text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white">
      {children}
    </span>
  );
}

/** Nome da linha numa PINCELADA de aquarela na cor dela (em vez de etiqueta). */
function LineLabel({ color, name, toward, stops, f, seed }: { color: string; name: string; toward: string; stops: string; f: string; seed: number }) {
  const id = `${f}-swash-${seed}`;
  return (
    <div className="py-2.5 font-body text-100 leading-tight">
      <span className="relative inline-flex px-3.5 py-1.5">
        <svg aria-hidden="true" viewBox="0 0 120 32" preserveAspectRatio="none" className="absolute -inset-x-1 -inset-y-0.5 h-[calc(100%+4px)] w-[calc(100%+8px)] overflow-visible">
          <defs>
            <filter id={id} x="-10%" y="-30%" width="120%" height="160%">
              <feTurbulence type="fractalNoise" baseFrequency="0.06 0.18" numOctaves="2" seed={seed} result="wob" />
              <feDisplacementMap in="SourceGraphic" in2="wob" scale="4" result="shape" />
              <feTurbulence type="fractalNoise" baseFrequency="0.9 0.12" numOctaves="2" seed={seed + 5} result="grain" />
              <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.45" result="pig" />
              <feComposite in="shape" in2="pig" operator="in" />
            </filter>
          </defs>
          <g fill={color} filter={`url(#${id})`}>
            {/* passada principal, com a ponta de saída do pincel mais fina */}
            <path d="M4 9 C22 3 62 2 104 4 C112 4 118 7 117 11 C116 17 117 22 114 26 C84 30 40 30 7 27 C2 24 1 14 4 9 Z" fillOpacity={0.9} />
            {/* segunda passada, mais rala e deslocada */}
            <path d="M10 5 C40 1 80 1 110 3 C114 6 114 9 112 11 C80 9 40 10 12 12 Z" fillOpacity={0.35} />
          </g>
        </svg>
        <span className="relative font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">{name}</span>
      </span>
      <p className="mt-1.5 text-text-primary">
        {toward} <span className="text-text-secondary">· {stops}</span>
      </p>
    </div>
  );
}

function Bubble({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-page text-terracota-700 shadow-[0_4px_12px_-6px_rgba(152,75,44,0.7)]">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </span>
  );
}

const ICON = {
  plane: <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />,
  bus: (
    <>
      <rect x="5" y="3.5" width="14" height="14" rx="2.5" />
      <path d="M5 11h14M8 17.5v2M16 17.5v2" />
      <circle cx="8.5" cy="14.5" r=".8" />
      <circle cx="15.5" cy="14.5" r=".8" />
    </>
  ),
  car: (
    <>
      <path d="M5 16V11.5L7 6.8A2 2 0 0 1 8.8 5.6h6.4A2 2 0 0 1 17 6.8l2 4.7V16" />
      <path d="M3.5 16h17M4.5 11.5h15" />
      <circle cx="7.5" cy="16.5" r="1.7" />
      <circle cx="16.5" cy="16.5" r="1.7" />
    </>
  ),
};

const ARROWS = (
  <span className="flex h-10 w-10 items-center justify-center">
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#2d2b23" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4v13m0 0-3-3m3 3 3-3M17 20V7m0 0-3 3m3-3 3 3" />
    </svg>
  </span>
);

export function MetroRoute({
  arrival,
  t,
  origin,
  originSub,
}: {
  arrival: ArrivalId;
  t: Dictionary["stay"]["arrival"]["metro"];
  origin: string;
  originSub: string;
}) {
  const route = ROUTES[arrival];
  const f = `metro${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const box = useRef<HTMLOListElement>(null);
  const geo = useGeo(box, arrival);
  const major = "font-body text-200 font-bold leading-tight text-text-primary";
  const sub = "mt-0.5 font-body text-100 leading-tight text-text-secondary";
  const color = (l: LineId) => LINE_COLORS[l];
  const last = route.legs[route.legs.length - 1]!;

  return (
    <figure aria-label={t.mapLabel.replace("{origin}", origin)} className="rounded-[1.25rem] bg-white/70 px-4 py-5 sm:px-6">
      <div className="relative">
        {geo && <Ink geo={geo} f={f} />}
        <ol ref={box} className="relative">
          {/* de onde a pessoa chega (terminal) */}
          <Row kind="origin" node={<Bubble>{ICON[route.origin]}</Bubble>} className="pb-3">
            <p className={major}>{origin}</p>
            <p className={sub}>{originSub}</p>
          </Row>

          {route.legs.map((leg, i) => {
            const prev = route.legs[i - 1];
            const board = leg.stations[0]!;
            const middle = leg.stations.slice(1, -1);
            return (
              <Fragment key={leg.line + i}>
                {i === 0 ? (
                  <Row kind="ring" c1={color(leg.line)} className="pb-1 pt-3">
                    <Badge>{t.board}</Badge>
                    <p className={`${major} mt-1`}>{board}</p>
                  </Row>
                ) : (
                  <Row kind="transfer" c1={color(prev!.line)} c2={color(leg.line)} node={ARROWS} className="py-2">
                    <Badge>{t.transfer}</Badge>
                    <p className={`${major} mt-1`}>{board}</p>
                    <p className={sub}>{t.transferSub.replace("{line}", t.lines[leg.line])}</p>
                  </Row>
                )}
                <Row>
                  <LineLabel
                    color={color(leg.line)}
                    name={t.lines[leg.line]}
                    toward={`${t.toward} ${leg.toward}`}
                    stops={t.stops.replace("{n}", String(leg.stations.length - 1))}
                    f={f}
                    seed={3 + i * 7}
                  />
                </Row>
                {middle.map((n) => (
                  <Row key={n} kind="dot" c1={color(leg.line)} className="py-[3px]">
                    <span className="font-body text-100 leading-tight text-text-secondary">{n}</span>
                  </Row>
                ))}
              </Fragment>
            );
          })}

          {/* desembarque */}
          <Row kind="end" c1={color(last.line)} className="py-2">
            <Badge>{t.getOff}</Badge>
            <p className={`${major} mt-1`}>{last.stations[last.stations.length - 1]}</p>
            <p className={sub}>{t.getOffSub}</p>
          </Row>

          {/* Uber / 99 */}
          <Row kind="car" node={<Bubble>{ICON.car}</Bubble>} className="pt-3">
            <p className="font-body text-200 leading-tight text-text-primary">{t.ride}</p>
          </Row>
        </ol>
      </div>
    </figure>
  );
}
