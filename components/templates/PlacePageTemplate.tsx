import Link from "next/link";
import { LanguageSwitcher } from "@/components/molecules/LanguageSwitcher";
import { Notice, NoticeCard } from "@/components/molecules/Notice";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { PlaceIcon } from "@/components/molecules/PlaceIcon";
import { PlaceMap } from "@/components/molecules/PlaceMap";
import { PlaceThumb } from "@/components/molecules/PlaceThumb";
import { PLACES, VENUE, directionsUrl, distanceKm, mapsSearchUrl, type Place } from "@/lib/content/places";
import { placeDesc, placeHref } from "@/lib/content/place-pages";
import { getDictionary, localeInfo, type Locale } from "@/lib/i18n/dictionaries";

/**
 * Template `PlacePageTemplate` — página de um lugar do "Onde ficar e
 * aproveitar" (#hospedagem), aberta ao tocar no card: foto, categoria, nome,
 * a nossa dica, distância até o salão, rota e Google Maps; embaixo, o mapa
 * com o lugar e o salão, o "Bom saber" da categoria e as outras opções da
 * mesma categoria. Cabeçalho branco igual ao das páginas "janela"
 * (Voltar · logo · idioma). O Voltar leva pra seção já filtrada na categoria.
 */
export function PlacePageTemplate({ locale, place }: { locale: Locale; place: Place }) {
  const t = getDictionary(locale);
  const a = t.around;
  const info = localeInfo(locale);
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-u-nu-latn" : locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const km = (p: Place) => a.distance.replace("{km}", `${nf.format(distanceKm(VENUE, p))} km`);
  const desc = placeDesc(t, place);
  const others = PLACES.filter((p) => p.category === place.category && p.id !== place.id).sort(
    (x, y) => distanceKm(VENUE, x) - distanceKm(VENUE, y),
  );
  const note =
    place.category === "hotel"
      ? { icon: "hotel" as const, title: t.stay.airbnbTitle, text: t.stay.airbnb }
      : place.category === "beleza"
        ? { icon: "beleza" as const, title: a.filters.beleza, text: t.tips.beautyNote }
        : { icon: "restaurante" as const, title: a.noteFoodTitle, text: t.tips.foodNote };

  return (
    <main lang={info.lang} dir={info.dir} className="min-h-screen">
      <header className="sticky top-0 z-20 grid h-[72px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 bg-white px-4 shadow-[0_10px_30px_-24px_rgba(45,43,35,0.45)] md:px-6">
        <Link
          href={`${info.href}?lugares=${place.category}#hospedagem`}
          className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 justify-self-start font-body text-100 uppercase tracking-[0.18em] text-text-primary hover:text-terracota-700"
        >
          <span aria-hidden="true" className="text-200 rtl:-scale-x-100">←</span> <span className="sr-only sm:not-sr-only">{a.detail.back}</span>
        </Link>
        <Link href={info.href} aria-label={t.nav.home} className="justify-self-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-ge.svg" alt="" width={470} height={401} className="h-11 w-auto" />
        </Link>
        <div className="justify-self-end">
          <LanguageSwitcher locale={locale} label={t.nav.language} path={`/lugares/${place.id}`} />
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-4 pb-section-gap pt-10 sm:px-6 md:pt-16">
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] md:gap-12">
          <PaintReveal variant="rise" className="mx-auto w-full max-w-[320px]">
            <div className="aspect-square overflow-hidden rounded-[1.75rem] bg-page shadow-[0_18px_50px_-30px_rgba(152,75,44,0.75)]">
              <PlaceThumb place={place} />
            </div>
          </PaintReveal>

          <PaintReveal variant="rise" delay={120} className="text-center md:text-start">
            <p className="inline-flex items-center gap-2 font-body text-100 uppercase tracking-[0.3em] text-salvia-800">
              <PlaceIcon kind={place.category} className="h-4 w-4" />
              {a.filters[place.category]}
            </p>
            <h1 className="mt-3 font-display leading-tight text-text-title" style={{ fontSize: "clamp(2.4rem, 6vw, 4rem)" }}>
              {place.name}
            </h1>
            {desc && <p className="mt-4 font-body text-200 leading-relaxed text-text-primary">{desc}</p>}
            <p className="mt-5 font-body text-200 leading-tight">
              <strong className="text-terracota-700">{km(place)}</strong>{" "}
              <span className="text-100 text-text-secondary">({a.straight})</span>
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <a
                href={directionsUrl(place.query)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded-pill bg-salvia-700 px-5 font-body text-100 font-bold uppercase tracking-[0.12em] text-white shadow-[0_6px_16px_-10px_rgba(80,78,60,0.8)] transition-colors hover:bg-salvia-800"
              >
                {a.route}
              </a>
              <a
                href={mapsSearchUrl(place.query)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center gap-1.5 rounded-pill border border-salvia-700 px-5 font-body text-100 font-bold uppercase tracking-[0.12em] text-salvia-800 transition-colors hover:bg-salvia-50"
              >
                {a.detail.openMaps} <span aria-hidden="true">↗</span>
              </a>
            </div>
          </PaintReveal>
        </div>

        <div className="mt-12 md:mt-16">
          <PlaceMap
            place={place}
            labels={{ venue: a.venue, mapLabel: a.mapLabel, zoomIn: a.zoomIn, zoomOut: a.zoomOut, recenter: a.recenter }}
          />
        </div>

        <PaintReveal variant="rise" className="mx-auto mt-14 max-w-3xl">
          <NoticeCard label={a.notesTitle}>
            <Notice icon={<PlaceIcon kind={note.icon} className="h-6 w-6" />} title={note.title} text={note.text} />
          </NoticeCard>
        </PaintReveal>

        {others.length > 0 && (
          <section aria-labelledby="mais-lugares" className="mt-16">
            <h2 id="mais-lugares" className="text-center font-body text-100 uppercase tracking-[0.3em] text-terracota-700">
              {a.detail.more}
            </h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {others.map((p) => (
                <li key={p.id}>
                  <Link
                    href={placeHref(locale, p.id)}
                    className="flex items-center gap-4 rounded-card bg-page p-3 shadow-[0_14px_34px_-22px_rgba(152,75,44,0.6)] transition-shadow hover:shadow-[0_16px_34px_-16px_rgba(152,75,44,0.85)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
                  >
                    <span className="h-16 w-16 shrink-0 overflow-hidden rounded-[0.8rem]">
                      <PlaceThumb place={p} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-body text-200 font-bold leading-snug text-text-primary">{p.name}</span>
                      <span className="block font-body text-100 text-terracota-700">{km(p)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
