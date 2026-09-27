"use client";

import { useState } from "react";
import { PALETTE_STEPS, palette, type PaletteFamily } from "@/lib/design-system/tokens";

/**
 * Molecule `DressPalette` — a paleta do dress code (a mesma da identidade
 * visual: 7 famílias × 7 tons). Mostra a cor base de cada família como uma
 * mancha de aquarela; ao tocar numa cor, abre os sobretons dela, do mais
 * claro (50) ao mais escuro (900), com a base marcada no meio.
 *
 * A forma da mancha vem de `public/decor/capetown/mancha.webp` usada como
 * máscara CSS; a cor vem dos tokens (`palette`).
 */

const FAMILY_IDS: PaletteFamily[] = ["amarelo", "pessego", "terracota", "caramelo", "salvia", "linho", "ardosia"];

export interface DressPaletteLabels {
  families: Record<PaletteFamily, string>;
  group: string;
  hint: string;
  range: string;
  base: string;
  lighter: string;
  darker: string;
}

const BASE = "500";

const MASK = {
  WebkitMaskImage: "url(/decor/capetown/mancha.webp)",
  maskImage: "url(/decor/capetown/mancha.webp)",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
} as const;

function Blot({ color, className }: { color: string; className: string }) {
  return <span aria-hidden="true" className={["block", className].join(" ")} style={{ ...MASK, backgroundColor: color }} />;
}

export function DressPalette({ labels }: { labels: DressPaletteLabels }) {
  const [open, setOpen] = useState<PaletteFamily | null>(null);
  const FAMILIES = FAMILY_IDS.map((id) => ({ id, name: labels.families[id] }));
  const current = FAMILIES.find((f) => f.id === open);

  return (
    <div>
      <div role="group" aria-label={labels.group} className="mx-auto flex max-w-3xl flex-wrap justify-center gap-x-2 gap-y-4">
        {FAMILIES.map((f) => {
          const active = open === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              aria-controls="paleta-sobretons"
              onClick={() => setOpen(active ? null : f.id)}
              className={[
                "group flex w-[5.25rem] flex-col items-center gap-2 rounded-card px-1 py-2 transition-transform",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
                active ? "-translate-y-1" : "hover:-translate-y-0.5",
              ].join(" ")}
            >
              <Blot
                color={palette[f.id][BASE]}
                className={["h-14 w-14 transition-transform duration-300", active ? "scale-110" : "group-hover:scale-105"].join(" ")}
              />
              <span className={["font-body text-100 leading-tight", active ? "text-text-primary underline underline-offset-4" : "text-text-secondary"].join(" ")}>
                {f.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* sobretons da cor escolhida */}
      <div id="paleta-sobretons" aria-live="polite" className="mx-auto mt-4 max-w-3xl">
        {current ? (
          <div key={current.id} className="animate-[paleta-in_320ms_ease-out] rounded-card border border-caramelo-100 bg-page/85 px-4 py-5 backdrop-blur-[2px]">
            <p className="font-body text-100 uppercase tracking-[0.24em] text-text-secondary">
              {current.name} · {labels.range}
            </p>
            <ul className="mt-4 flex items-end justify-center gap-1.5 sm:gap-3">
              {PALETTE_STEPS.map((step) => {
                const base = step === BASE;
                return (
                  <li key={step} className="flex flex-col items-center gap-1.5">
                    <Blot
                      color={palette[current.id][step]}
                      className={base ? "h-14 w-14 sm:h-16 sm:w-16" : "h-10 w-10 sm:h-12 sm:w-12"}
                    />
                    <span className={["font-body text-[0.7rem] leading-none sm:text-100", base ? "text-text-primary" : "text-text-secondary"].join(" ")}>
                      {base ? labels.base : step}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 flex justify-between px-1 font-body text-[0.7rem] uppercase tracking-[0.18em] text-text-secondary sm:text-100">
              <span>{labels.lighter}</span>
              <span>{labels.darker}</span>
            </p>
          </div>
        ) : (
          <p className="text-center font-body text-100 italic text-text-secondary">
            {labels.hint}
          </p>
        )}
      </div>
    </div>
  );
}
