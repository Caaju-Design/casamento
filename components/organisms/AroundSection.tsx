"use client";

import { useMemo, useRef, useState } from "react";
import { AroundMap } from "@/components/molecules/AroundMap";
import { Notice, NoticeCard } from "@/components/molecules/Notice";
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
 * pin do salão e dos lugares, e a lista de cards horizontais (miniatura à
 * esquerda) do mais perto pro mais longe — no desktop ao lado do mapa, com
 * rolagem própria — cada um com a distância até o salão e o link de rota.
 * Card e pin conversam: tocar num destaca o outro.
 */

// sem "Todos": a seção já abre filtrada em hotéis (pedido do Manu)
type Filter = PlaceCategory;

/** "i" do rótulo Bom saber. */
function IconInfo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5M12 7.6v.1" />
    </svg>
  );
}

/** Símbolo do Airbnb (o "Bélo") em traço, na cor dos outros ícones. */
function IconAirbnb() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-1.2 0-1.9.8-2.7 2.4L4.6 15.2c-1.2 2.6.4 5.4 3 5.4 1.6 0 3-1 4.4-2.6 1.4 1.6 2.8 2.6 4.4 2.6 2.6 0 4.2-2.8 3-5.4l-4.7-9.8C13.9 3.8 13.2 3 12 3z" />
      <path d="M12 18c-1.8-2.2-2.8-4-2.8-5.4 0-1.4 1.2-2.3 2.8-2.3s2.8.9 2.8 2.3c0 1.4-1 3.2-2.8 5.4z" />
    </svg>
  );
}
const FILTERS: Filter[] = ["hotel", "cafe", "restaurante", "shopping", "beleza"];

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
  const [filter, setFilter] = useState<Filter>("hotel");
  const [activeId, setActiveId] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLLIElement>());
  const listRef = useRef<HTMLUListElement>(null);

  // descrições: as de comer/beleza vêm das Dicas (por nome), as de hotel do próprio bloco
  const descByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const g of [...tips.food, ...tips.beauty]) for (const p of g.places) m.set(p.name, p.desc);
    return m;
  }, [tips]);

  const nf = useMemo(() => new Intl.NumberFormat(locale === "ar" ? "ar-u-nu-latn" : locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 }), [locale]);

  const places = useMemo(
    () =>
      PLACES.filter((p) => p.category === filter)
        .map((p) => ({ ...p, km: distanceKm(VENUE, p) }))
        .sort((a, b) => a.km - b.km),
    [filter],
  );

  const select = (id: string, fromMap = false) => {
    setActiveId((cur) => (cur === id && !fromMap ? null : id));
    if (fromMap) {
      const card = cardRefs.current.get(id);
      const list = listRef.current;
      if (card && list && list.scrollHeight > list.clientHeight) {
        list.scrollTo({ top: card.offsetTop - list.offsetTop - 8, behavior: "smooth" });
      } else {
        card?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  };

  const chip = (active: boolean) =>
    [
      "inline-flex min-h-[40px] shrink-0 items-center gap-2 rounded-pill px-4 font-body text-100 transition-colors shadow-[0_6px_16px_-10px_rgba(152,75,44,0.7)]",
      "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
      active ? "bg-terracota-700 text-white" : "bg-page text-text-primary hover:text-terracota-700",
    ].join(" ");

  return (
    <section id="hospedagem" aria-labelledby="hospedagem-titulo" className="relative pb-section-gap pt-section-gap">
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
              <PlaceIcon kind={f} className="h-4 w-4" />
              {t.filters[f]}
            </button>
          ))}
        </div>

        {/* mapa + lista: no desktop, duas colunas (lista com rolagem própria); no celular, empilhados */}
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <AroundMap
              places={places}
              activeId={activeId}
              onSelect={(id) => select(id, true)}
              labels={{ venue: t.venue, mapLabel: t.mapLabel, zoomIn: t.zoomIn, zoomOut: t.zoomOut, recenter: t.recenter }}
            />
          </div>

          <ul
            ref={listRef}
            className="space-y-3 lg:max-h-[560px] lg:overflow-y-auto lg:overscroll-contain lg:pe-2 [scrollbar-color:theme(colors.caramelo.200)_transparent] [scrollbar-width:thin]"
          >
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
                >
                  <article
                    className={[
                      "flex gap-4 rounded-card bg-page p-3 transition-shadow duration-200 sm:p-4",
                      active ? "shadow-[0_16px_34px_-16px_rgba(152,75,44,0.85)]" : "shadow-[0_14px_34px_-22px_rgba(152,75,44,0.6)] hover:shadow-[0_16px_34px_-18px_rgba(152,75,44,0.7)]",
                    ].join(" ")}
                  >
                    {/* miniatura à esquerda */}
                    <button
                      type="button"
                      onClick={() => select(p.id)}
                      aria-label={p.name}
                      className="h-24 w-24 shrink-0 overflow-hidden rounded-[0.9rem] sm:h-28 sm:w-28"
                    >
                      <PlaceThumb place={p} />
                    </button>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <button type="button" onClick={() => select(p.id)} aria-pressed={active} className="text-start">
                        <span className="block font-body text-200 font-bold leading-snug text-text-primary">{p.name}</span>
                        <span className="mt-0.5 inline-flex items-center gap-1.5 font-body text-[0.7rem] uppercase tracking-[0.14em] text-salvia-800">
                          <PlaceIcon kind={p.category} className="h-3.5 w-3.5" />
                          {t.filters[p.category]}
                        </span>
                      </button>
                      {desc && <p className="mt-1.5 line-clamp-2 font-body text-100 leading-relaxed text-text-secondary">{desc}</p>}
                      <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                        <span className="font-body text-100 leading-tight text-text-primary">
                          <strong className="text-terracota-700">{t.distance.replace("{km}", `${nf.format(p.km)} km`)}</strong>
                          <span className="block text-[0.65rem] text-text-secondary">{t.straight}</span>
                        </span>
                        <a
                          href={directionsUrl(p.query)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[36px] shrink-0 items-center rounded-pill bg-page px-3 shadow-[0_6px_16px_-10px_rgba(152,75,44,0.7)] font-body text-[0.7rem] uppercase tracking-[0.12em] text-terracota-700 transition-colors hover:bg-terracota-700 hover:text-white"
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
        </div>

        {/* bom saber: mesmo visual do card "Importante" do Onde será */}
        <PaintReveal variant="rise" className="mx-auto mt-14 max-w-3xl">
          <NoticeCard label={t.notesTitle} icon={<IconInfo />}>
            <Notice icon={<IconAirbnb />} title={stay.airbnbTitle} text={stay.airbnb} />
            <Notice icon={<PlaceIcon kind="restaurante" className="h-6 w-6" />} title={t.noteFoodTitle} text={tips.foodNote} />
            <Notice icon={<PlaceIcon kind="beleza" className="h-6 w-6" />} title={t.filters.beleza} text={tips.beautyNote} />
          </NoticeCard>
        </PaintReveal>
      </div>
    </section>
  );
}
