"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import { ICON_PATHS } from "@/components/molecules/PlaceIcon";
import { VENUE, type Place } from "@/lib/content/places";

/**
 * Molecule `AroundMap` — mapa leve (Leaflet + base padrão do OpenStreetMap,
 * sem chave de API, amaciada por filtro CSS nos tons do site) TRAVADO na região do casamento: o pan não sai de um raio
 * de uns 3 km e o zoom vai de 13 a 18. Só carrega os pedacinhos (tiles) da
 * área vista, e o Leaflet só é baixado quando a seção chega perto da tela.
 *
 * - Pin grande terracota = o salão; pins redondos = lugares, com o ícone da
 *   categoria. O pin ativo cresce e mostra o nome.
 * - Rolar a página por cima do mapa NÃO dá zoom (pra não prender a rolagem):
 *   zoom pelos botões, pinça ou duplo clique.
 */

const BOUNDS: [[number, number], [number, number]] = [
  [-23.662, -46.742],
  [-23.592, -46.672],
];

export interface AroundMapLabels {
  venue: string;
  mapLabel: string;
  zoomIn: string;
  zoomOut: string;
  recenter: string;
}

function iconHtml(kind: keyof typeof ICON_PATHS, label: string, active: boolean, venue = false) {
  const size = venue ? 46 : active ? 40 : 32;
  // fora de foco: oliva (salvia.700) pra contrastar com o mapa; ativo: terracota escuro
  const bg = venue ? "#984b2c" : active ? "#723921" : "#848169";
  const fg = "#ffffff";
  const svg = `<svg viewBox="0 0 24 24" width="${Math.round(size * 0.5)}" height="${Math.round(size * 0.5)}" fill="${venue ? "#fff" : "none"}" stroke="${fg}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[kind]}</svg>`;
  const name =
    venue || active
      ? `<span class="around-pin__label${venue ? " around-pin__label--venue" : ""}">${label}</span>`
      : "";
  return `<div class="around-pin${active ? " is-active" : ""}" style="--s:${size}px;--bg:${bg}">${svg}</div>${name}`;
}

export function AroundMap({
  places,
  activeId,
  onSelect,
  labels,
}: {
  places: Place[];
  activeId: string | null;
  onSelect: (id: string) => void;
  labels: AroundMapLabels;
}) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const L = useRef<typeof import("leaflet") | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // cria o mapa só quando a seção se aproxima da tela
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((e) => e.isIntersecting) || map.current) return;
        io.disconnect();
        const leaflet = await import("leaflet");
        if (cancelled || !box.current) return;
        L.current = leaflet;
        const m = leaflet.map(box.current, {
          center: [VENUE.lat, VENUE.lng],
          zoom: 14,
          minZoom: 13,
          maxZoom: 18,
          maxBounds: BOUNDS,
          maxBoundsViscosity: 1,
          zoomControl: false,
          scrollWheelZoom: false,
          attributionControl: true,
        });
        leaflet
          // base padrão do OpenStreetMap: não precisa de chave (a da CARTO passou a exigir)
          .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
          })
          .addTo(m);
        leaflet
          .marker([VENUE.lat, VENUE.lng], {
            icon: leaflet.divIcon({ className: "around-marker", html: iconHtml("venue", labels.venue, false, true), iconSize: [46, 46], iconAnchor: [23, 23] }),
            zIndexOffset: 1000,
            keyboard: false,
            title: labels.venue,
          })
          .addTo(m);
        m.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
        map.current = m;
        el.dispatchEvent(new Event("around:ready"));
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
      map.current?.remove();
      map.current = null;
      markers.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // (re)desenha os pins quando o filtro ou o ativo mudam
  useEffect(() => {
    const draw = () => {
      const m = map.current;
      const leaflet = L.current;
      if (!m || !leaflet) return;
      markers.current.forEach((mk) => mk.remove());
      markers.current.clear();
      for (const p of places) {
        const active = p.id === activeId;
        const mk = leaflet
          .marker([p.lat, p.lng], {
            icon: leaflet.divIcon({
              className: "around-marker",
              html: iconHtml(p.category, p.name, active),
              iconSize: active ? [40, 40] : [32, 32],
              iconAnchor: active ? [20, 20] : [16, 16],
            }),
            title: p.name,
            alt: p.name,
            zIndexOffset: active ? 900 : 0,
          })
          .on("click", () => onSelectRef.current(p.id))
          .addTo(m);
        markers.current.set(p.id, mk);
      }
      const act = places.find((p) => p.id === activeId);
      if (act) {
        m.flyTo([act.lat, act.lng], Math.max(m.getZoom(), 15), { duration: 0.6 });
      } else if (places.length) {
        const b = leaflet.latLngBounds([[VENUE.lat, VENUE.lng], ...places.map((p) => [p.lat, p.lng] as [number, number])]);
        m.flyToBounds(b, { padding: [48, 48], maxZoom: 16, duration: 0.6 });
      }
    };
    draw();
    const el = box.current;
    el?.addEventListener("around:ready", draw);
    return () => el?.removeEventListener("around:ready", draw);
  }, [places, activeId]);

  const btn =
    "flex h-10 w-10 items-center justify-center bg-white/95 text-text-primary transition-colors hover:bg-pessego-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus";

  return (
    <div className="relative isolate overflow-hidden rounded-[1.75rem] border border-caramelo-100 bg-[#efe9df] shadow-[0_18px_50px_-34px_rgba(45,43,35,0.5)]">
      <div ref={box} role="region" aria-label={labels.mapLabel} className="around-map h-[62svh] max-h-[560px] min-h-[340px] w-full" />
      {/* controles: voltar pro salão + zoom */}
      <div className="absolute bottom-4 end-4 z-[500] flex flex-col items-center gap-3">
        <button
          type="button"
          aria-label={labels.recenter}
          title={labels.recenter}
          onClick={() => map.current?.flyTo([VENUE.lat, VENUE.lng], 16, { duration: 0.6 })}
          className={`${btn} rounded-full shadow-md`}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" />
            <path d="m14.8 9.2-1.6 4-4 1.6 1.6-4z" />
          </svg>
        </button>
        <div className="flex flex-col overflow-hidden rounded-full shadow-md">
          <button type="button" aria-label={labels.zoomIn} title={labels.zoomIn} onClick={() => map.current?.zoomIn()} className={btn}>
            <span aria-hidden="true" className="text-[1.4rem] leading-none">+</span>
          </button>
          <span aria-hidden="true" className="h-px bg-caramelo-100" />
          <button type="button" aria-label={labels.zoomOut} title={labels.zoomOut} onClick={() => map.current?.zoomOut()} className={btn}>
            <span aria-hidden="true" className="text-[1.4rem] leading-none">−</span>
          </button>
        </div>
      </div>
    </div>
  );
}
