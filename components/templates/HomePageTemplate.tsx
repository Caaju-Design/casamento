import { Painting } from "@/components/atoms/Painting";
import { AnchorNav } from "@/components/molecules/AnchorNav";
import { DressCodeSection } from "@/components/organisms/DressCodeSection";
import { EventSection } from "@/components/organisms/EventSection";
import { GiftSection } from "@/components/organisms/GiftSection";
import { HeroSection } from "@/components/organisms/HeroSection";
import { StaySection } from "@/components/organisms/StaySection";
import { StorySection } from "@/components/organisms/StorySection";
import { TipsSection } from "@/components/organisms/TipsSection";
import { getDictionary, localeInfo, type Locale } from "@/lib/i18n/dictionaries";

/** Template `HomePageTemplate` — esqueleto da home one-page. */
export function HomePageTemplate({ locale = "pt" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const info = localeInfo(locale);
  const navItems = [
    { href: "#historia", label: t.nav.historia },
    { href: "#evento", label: t.nav.evento },
    { href: "#dresscode", label: t.nav.dresscode },
    { href: "#presentes", label: t.nav.presentes },
    { href: "#hospedagem", label: t.nav.hospedagem },
    { href: "#dicas", label: t.nav.dicas },
  ];
  return (
    <div lang={info.lang} dir={info.dir} className="flex flex-col overflow-x-clip">
      <AnchorNav items={navItems} startHiddenForHero locale={locale} labels={t.nav} />
      <HeroSection labels={t.hero} />

      <StorySection t={t.story} />
      <EventSection t={t.event} locale={locale} />
      <DressCodeSection t={t.dress} />
      <GiftSection t={t.gift} locale={locale} />
      <StaySection t={t.stay} />
      <TipsSection t={t.tips} />

      <footer className="relative isolate px-6 pb-[calc(min(75vw,320px)+1.5rem)] pt-section-gap text-center">
        <Painting name="baia-veleiro" className="absolute bottom-0 left-1/2 w-[min(80vw,340px)] -translate-x-1/2" />
        <p className="font-display leading-snug text-text-primary" style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}>
          {t.footer.title}
        </p>
        <p className="mt-3 font-body text-100 uppercase tracking-[0.24em] text-text-secondary">{t.footer.signature}</p>
      </footer>
    </div>
  );
}
