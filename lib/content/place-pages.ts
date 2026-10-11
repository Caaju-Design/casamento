import type { Place } from "@/lib/content/places";
import { localeInfo, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

/**
 * Página de cada lugar do "Onde ficar e aproveitar": /lugares/<id>,
 * /en/lugares/<id> e /ar/lugares/<id>.
 */
export function placeHref(locale: Locale, id: string): string {
  const base = localeInfo(locale).href;
  return `${base === "/" ? "" : base}/lugares/${id}`;
}

/** Descrição do lugar: a de hotel vem do bloco `around`, as de comer/beleza das Dicas (por nome). */
export function placeDesc(t: Pick<Dictionary, "around" | "tips">, place: Place): string | undefined {
  if (place.category === "hotel") return t.around.hotelDesc[place.id];
  for (const g of [...t.tips.food, ...t.tips.beauty]) {
    const hit = g.places.find((p) => p.name === place.name);
    if (hit) return hit.desc;
  }
  return undefined;
}
