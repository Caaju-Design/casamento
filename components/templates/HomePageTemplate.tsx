import { AnchorNav } from "@/components/molecules/AnchorNav";
import { DressCodeSection } from "@/components/organisms/DressCodeSection";
import { RsvpButton, RsvpSection } from "@/components/organisms/RsvpSection";
import { EventSection } from "@/components/organisms/EventSection";
import { GiftSection } from "@/components/organisms/GiftSection";
import { LiveSection } from "@/components/organisms/LiveSection";
import { PlacesSection } from "@/components/organisms/PlacesSection";
import { PreWeddingSection } from "@/components/organisms/PreWeddingSection";
import { HeroSection } from "@/components/organisms/HeroSection";
import { StorySection } from "@/components/organisms/StorySection";
import { AroundSection } from "@/components/organisms/AroundSection";
import { ArriveSection } from "@/components/organisms/ArriveSection";
import { getDictionary, localeInfo, type Locale } from "@/lib/i18n/dictionaries";

/** Template `HomePageTemplate` — esqueleto da home one-page. */
export function HomePageTemplate({ locale = "pt" }: { locale?: Locale }) {
  const t = getDictionary(locale);
  const info = localeInfo(locale);
  // os marcados com `instant` ficam lá no fim da página: o clique leva direto
  // pra seção, sem a rolagem suave atravessando o site inteiro
  const navItems = [
    { href: "#historia", label: t.nav.historia },
    { href: "#evento", label: t.nav.evento },
    { href: "#dresscode", label: t.nav.dresscode },
    { href: "#hospedagem", label: t.nav.hospedagem },
    { href: "#como-chegar", label: t.nav.comoChegar },
    { href: "#presentes", label: t.nav.presentes, instant: true },
    { href: "#pre-wedding", label: t.nav.galeria, instant: true },
    { href: "#ao-vivo", label: t.nav.transmissao, instant: true },
    { href: "#confirmar", label: t.nav.rsvp, instant: true },
  ];
  return (
    <div lang={info.lang} dir={info.dir} className="flex flex-col overflow-x-clip">
      <AnchorNav items={navItems} startHiddenForHero locale={locale} labels={t.nav} />
      <HeroSection labels={t.hero} />

      <StorySection t={t.story} />
      <EventSection t={t.event} locale={locale} />
      <RsvpSection t={t.rsvp} locale={locale} />
      <DressCodeSection t={t.dress} />
      {/* hospedagem e dicas vêm antes dos presentes (pedido do Manu) */}
      <AroundSection t={t.around} tips={t.tips} stay={t.stay} locale={locale} />
      <ArriveSection t={t.stay} />
      <GiftSection t={t.gift} locale={locale} />
      <PreWeddingSection t={t.prewedding} />
      {/* pra quem não vai conseguir vir: transmissão ao vivo (em breve) */}
      <LiveSection t={t.live} />
      {/* fecho: "Lugares que nos formaram" (arte do manual dos padrinhos) */}
      <PlacesSection t={t.formed} />

      {/* rodapé: a aquarela da baía saiu; aqui vai entrar uma foto do pré-wedding (pedido do Manu) */}
      <footer className="relative isolate px-6 pb-section-gap pt-section-gap text-center">
        <p className="font-display leading-snug text-text-title" style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}>
          {t.footer.title}
        </p>
        {/* o botão de confirmar presença de novo, pra quem chegou até o fim */}
        <RsvpButton t={t.rsvp} locale={locale} className="mt-7" />
        <p className="mt-7 font-body text-100 uppercase tracking-[0.24em] text-text-secondary">{t.footer.signature}</p>
      </footer>
      {/* rodapé fininho: crédito da Caáju */}
      <div className="px-6 py-2 text-center font-body text-[0.72rem] tracking-[0.06em] text-text-secondary">
        {t.footer.credit}{" "}
        {/* <bdi>: no árabe, o nome (em letras latinas) não embaralha o ponto final */}
        <bdi>
        <a
          href="https://www.caaju.com.br"
          target="_blank"
          rel="noopener"
          className="font-bold text-text-primary transition-colors hover:text-terracota-700"
        >
          Caáju Design Ltda.
        </a>
        </bdi>
      </div>
    </div>
  );
}
