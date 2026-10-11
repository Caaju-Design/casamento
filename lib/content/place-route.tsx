import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlacePageTemplate } from "@/components/templates/PlacePageTemplate";
import { PLACES, getPlace } from "@/lib/content/places";
import { placeDesc, placeHref } from "@/lib/content/place-pages";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";

/**
 * Peças compartilhadas pelas rotas /lugares/[id], /en/lugares/[id] e
 * /ar/lugares/[id]: todas as páginas saem prontas no build (uma por lugar de
 * lib/content/places.ts); id que não existe dá 404.
 */
export type PlaceRouteProps = { params: Promise<{ id: string }> };

export function placeStaticParams() {
  return PLACES.map((p) => ({ id: p.id }));
}

export async function placeMetadata(locale: Locale, { params }: PlaceRouteProps): Promise<Metadata> {
  const place = getPlace((await params).id);
  if (!place) return {};
  const t = getDictionary(locale);
  const d = t.around.detail;
  return {
    title: d.metaTitle.replace("{name}", place.name),
    description: placeDesc(t, place) ?? d.metaDescription.replace("{name}", place.name),
    alternates: {
      canonical: placeHref(locale, place.id),
      languages: { "pt-BR": placeHref("pt", place.id), en: placeHref("en", place.id), ar: placeHref("ar", place.id) },
    },
  };
}

export async function PlaceRoute({ locale, params }: PlaceRouteProps & { locale: Locale }) {
  const place = getPlace((await params).id);
  if (!place) notFound();
  return <PlacePageTemplate locale={locale} place={place} />;
}
