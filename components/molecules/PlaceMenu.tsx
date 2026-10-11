import type { Menu, MenuSection } from "@/lib/content/menus";
import { localeInfo, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

/**
 * Molecule `PlaceMenu` — cardápio na página do lugar, sem fotos: "Para
 * comer" e "Para beber" lado a lado no desktop, cada categoria numa sanfona
 * (<details>) fechada, pra não encher a tela. Nome do prato, preço e a
 * descrição no idioma da página.
 */
export function PlaceMenu({ menu, locale, t }: { menu: Menu; locale: Locale; t: Dictionary["around"]["detail"] }) {
  const lang = localeInfo(locale).lang;
  const money = new Intl.NumberFormat(locale === "ar" ? "ar-u-nu-latn" : lang, { style: "currency", currency: "BRL" });
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-u-nu-latn" : lang, { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${menu.checked}-15T12:00:00Z`),
  );

  const group = (title: string, sections: MenuSection[]) => (
    <div>
      <h3 className="font-body text-100 uppercase tracking-[0.3em] text-terracota-700">{title}</h3>
      <div className="mt-4 space-y-3">
        {sections.map((s) => (
          <details key={s.id} className="group rounded-card bg-page shadow-[0_14px_34px_-22px_rgba(152,75,44,0.6)] open:shadow-[0_16px_34px_-18px_rgba(152,75,44,0.7)]">
            <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-3 rounded-card px-5 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus [&::-webkit-details-marker]:hidden">
              <span className="font-body text-200 font-bold text-text-primary">{s.title[locale]}</span>
              <span className="flex shrink-0 items-center gap-3 font-body text-100 text-text-secondary">
                {t.menuCount.replace("{n}", String(s.items.length))}
                <span aria-hidden="true" className="text-terracota-700 transition-transform group-open:rotate-180">▾</span>
              </span>
            </summary>
            <div className="border-t border-caramelo-100 px-5 pb-5 pt-3">
              {s.note && <p className="mb-3 font-body text-100 leading-relaxed text-text-secondary">{s.note[locale]}</p>}
              <ul className="divide-y divide-caramelo-100/70">
                {s.items.map((it, i) => (
                  <li key={`${it.name}-${i}`} className="py-2.5">
                    <div className="flex items-baseline justify-between gap-4">
                      <span lang="pt-BR" className="font-body text-200 leading-snug text-text-primary">{it.name}</span>
                      {it.price !== undefined && <span dir="ltr" className="shrink-0 whitespace-nowrap font-body text-200 font-bold text-terracota-700">{money.format(it.price)}</span>}
                    </div>
                    {it.prices && (
                      <p className="mt-0.5 font-body text-100 text-terracota-700">
                        {it.prices.map((p, j) => (
                          <span key={j}>
                            {j > 0 && " · "}
                            {p.label[locale]}: <bdi dir="ltr">{money.format(p.value)}</bdi>
                          </span>
                        ))}
                      </p>
                    )}
                    {it.desc && <p className="mt-0.5 font-body text-100 leading-relaxed text-text-secondary">{it.desc[locale]}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </div>
  );

  return (
    <section aria-labelledby="cardapio" className="mt-14 md:mt-16">
      <h2 id="cardapio" className="text-center font-display leading-tight text-text-title" style={{ fontSize: "clamp(2.2rem, 5vw, 3.2rem)" }}>
        {t.menuTitle}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-center font-body text-100 text-text-secondary">{t.menuNote.replace("{date}", date)}</p>
      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-8">
        {group(t.menuFood, menu.food)}
        {group(t.menuDrinks, menu.drinks)}
      </div>
    </section>
  );
}
