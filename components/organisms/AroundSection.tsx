"use client";

import { useMemo, useRef, useState } from "react";
import { AroundMap } from "@/components/molecules/AroundMap";
import { PlaceIcon } from "@/components/molecules/PlaceIcon";
import { PlaceThumb } from "@/components/molecules/PlaceThumb";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { PLACES, VENUE, directionsUrl, distanceKm, type PlaceCategory } from "@/lib/content/places";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

/**
 * Organism `AroundSection` (#hospedagem) — "Onde ficar e aproveitar": junta a
 * antiga Hospedagem com as Dicas da região (onde comer + salões e
 * barbearias). Filtros em cima, mapa travado na região (`AroundMap`) com o
 * pin do salão e dos lugares, e os cards embaixo, do mais perto pro mais
 * longe, cada um com a distância até o salão e o link de rota.
 * Card e pin conversam: tocar num destaca o outro.
 */

type Filter = "all" | PlaceCategory;
const FILTERS: Filter[] = ["all", "hotel", "cafe", "restaurante", "shopping", "beleza"];

export function AroundSection({
  t,
  tips,
  stay,
  locale,
}: {
  t: Dictionary["around"];
  tips: Dictionary["tips"];
  stay: Dictionary["stay"];
  locale: Locale;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLLIElement>());

  // descrições: as de comer/beleza vêm das Dicas (por nome), as de hotel do próprio bloco
  const descByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of [...tips.food, ...tips.beauty]) for (const p of g.places) m.set(p.name, p.desc);
    return m;
  }, [tips]);

  const nf = useMemo(() => new Intl.NumberFormat(locale === "ar" ? "ar-u-nu-latn" : locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }), [locale]);

  const places = useMemo(
    () =>
      PLACES.filter((p) => filter === "all" || p.category === filter)
        .map((p) => ({ ...p, km: distanceKm(VENUE, p) }))
        .sort((a, b) => a.km - b.km),
    [filter],
  );

  const select = (id: string, fromMap = false) => {
    setActiveId((cur) => (cur === id && !fromMap ? null : id));
    if (fromMap) cardRefs.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const chip = (active: boolean) =>
    [
      "inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-pill border px-4 font-body text-100 transition-colors",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
      active ? "border-terracota-700 bg-terracota-700 text-white" : "border-caramelo-100 bg-white/80 text-text-primary hover:border-terracota-500",
    ].join(" ");

  return (
    <section id="hospedagem" aria-labelledby="hospedagem-titulo" className="relative isolate pb-section-gap pt-section-gap">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="hospedagem-titulo" eyebrow={t.eyebrow} title={t.title} lead={t.lead} highlight />

        {/* filtros */}
        <div role="toolbar" aria-label={t.filters.all} className="-mx-4 mt-10 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => {
                setFilter(f);
                setActiveId(null);
              }}
              className={chip(filter === f)}
            >
              {f !== "all" && <PlaceIcon kind={f} className="h-4 w-4" />}
              {t.filters[f]}
            </button>
          ))}
        </div>

        {/* mapa */}
        <div className="mt-5">
          <AroundMap
            places={places}
            activeId={activeId}
            onSelect={(id) => select(id, true)}
            labels={{ venue: t.venue, mapLabel: t.mapLabel, zoomIn: t.zoomIn, zoomOut: t.zoomOut, recenter: t.recenter }}
          />
        </div>

        {/* cards */}
        <ul className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:snap-none md:grid-cols-3 md:overflow-visible md:px-0">
          {places.map((p) => {
            const active = p.id === activeId;
            const desc = p.category === "hotel" ? t.hotelDesc[p.id] : descByName.get(p.name);
            return (
              <li
                key={p.id}
                ref={(el) => {
                  if (el) cardRefs.current.set(p.id, el);
                  else cardRefs.current.delete(p.id);
                }}
                className="w-[78%] shrink-0 snap-center sm:w-[46%] md:w-auto"
              >
                <article
                  className={[
                    "flex h-full flex-col overflow-hidden rounded-card border bg-white/85 transition-[border-color,box-shadow,transform] duration-200",
                    active ? "-translate-y-1 border-terracota-500 shadow-[0_16px_34px_-22px_rgba(152,75,44,0.8)]" : "border-caramelo-100 hover:border-terracota-200",
                  ].join(" ")}
                >
                  <button type="button" onClick={() => select(p.id)} aria-label={p.name} className="block w-full">
                    <PlaceThumb place={p} />
                  </button>
                  <div className="flex flex-1 flex-col p-5">
                  <button type="button" onClick={() => select(p.id)} aria-pressed={active} className="flex items-start gap-3 text-start">
                    <span className={["mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full", active ? "bg-terracota-700 text-white" : "bg-pessego-50 text-terracota-700"].join(" ")}>
                      <PlaceIcon kind={p.category} />
                    </span>
                    <span>
                      <span className="block font-body text-200 font-bold leading-snug text-text-primary">{p.name}</span>
                      <span className="mt-0.5 block font-body text-100 uppercase tracking-[0.14em] text-salvia-800">{t.filters[p.category]}</span>
                    </span>
                  </button>
                  {desc && <p className="mt-3 flex-1 font-body text-200 leading-relaxed text-text-secondary">{desc}</p>}
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-caramelo-100 pt-3">
                    <span className="font-body text-100 text-text-primary">
                      <strong className="text-terracota-700">{t.distance.replace("{km}", `${nf.format(p.km)} km`)}</strong>
                      <span className="block text-[0.7rem] text-text-secondary">{t.straight}</span>
                    </span>
                    <a
                      href={directionsUrl(p.query)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[40px] items-center rounded-pill border border-terracota-500 px-4 font-body text-100 uppercase tracking-[0.12em] text-terracota-700 transition-colors hover:bg-terracota-500 hover:text-white"
                    >
                      {t.route}
                    </a>
                  </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        {/* bom saber: airbnb, bairros e avisos */}
        <PaintReveal variant="rise" className="mx-auto mt-10 max-w-3xl rounded-card border border-caramelo-100 bg-page/80 p-7 backdrop-blur-[2px]">
          <h3 className="font-body text-100 font-bold uppercase tracking-[0.24em] text-terracota-700">{t.notesTitle}</h3>
          <ul className="mt-4 space-y-3 font-body text-200 leading-relaxed text-text-secondary">
            <li>
              <strong className="text-text-primary">{stay.airbnbTitle}:</strong> {stay.airbnb}
            </li>
            <li>{tips.foodNote}</li>
            <li>{tips.beautyNote}</li>
          </ul>
        </PaintReveal>
      </div>
    </section>
  );
}
