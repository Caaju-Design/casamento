import { Painting } from "@/components/atoms/Painting";
import { AnchorNav } from "@/components/molecules/AnchorNav";
import { DressCodeSection } from "@/components/organisms/DressCodeSection";
import { RsvpButton, RsvpSection } from "@/components/organisms/RsvpSection";
import { EventSection } from "@/components/organisms/EventSection";
import { GiftSection } from "@/components/organisms/GiftSection";
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
  // "Com amor, Gabriela & Emanuel" → ["Com amor,", "Gabriela & Emanuel"] (vírgula comum ou árabe)
  const sigCut = t.footer.signature.search(/[,،]/) + 1;
  const sigLead = sigCut > 0 ? t.footer.signature.slice(0, sigCut) : "";
  const sigNames = sigCut > 0 ? t.footer.signature.slice(sigCut).trim() : t.footer.signature;
  const navItems = [
    { href: "#historia", label: t.nav.historia },
    { href: "#evento", label: t.nav.evento },
    { href: "#dresscode", label: t.nav.dresscode },
    { href: "#hospedagem", label: t.nav.hospedagem },
    { href: "#como-chegar", label: t.nav.comoChegar },
    { href: "#presentes", label: t.nav.presentes, instant: true },
    { href: "#pre-wedding", label: t.nav.galeria, instant: true },
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

      {/* rodapé: a aquarela da baía saiu; aqui vai entrar uma foto do pré-wedding (pedido do Manu) */}
      <footer className="relative px-6 pb-[max(10rem,20vw)] pt-section-gap text-center">
        {/* pedras nos cantos de baixo: a do ipê à esquerda, a das agaves (espelhada) à direita */}
        <Painting name="arbusto-pedra-canto" className="absolute bottom-0 left-0 w-[40vw] max-w-[300px]" />
        <Painting name="arbustos-pedras" flip className="absolute bottom-0 right-0 w-[40vw] max-w-[300px]" />
        <p className="font-display leading-snug text-text-title" style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)" }}>
          {t.footer.title}
        </p>
        {/* o botão de confirmar presença de novo, pra quem chegou até o fim */}
        <RsvpButton t={t.rsvp} locale={locale} className="mt-7" />
        {/*
          assinatura "à mão" em nanquim, FIXA (sem animação): a caligrafia passa por um filtro de
          tinta (SVG) — traço levemente tremido, mais grosso onde a "caneta
          apertou" (manchas de ruído bem largas engordam o traço), bordas que
          incham um pouco como tinta no papel e pigmento irregular.
        */}
        <svg aria-hidden="true" width="0" height="0" className="absolute">
          <filter id="nanquim" x="-5%" y="-20%" width="110%" height="140%" colorInterpolationFilters="sRGB">
            {/* mão: tremor sutil */}
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="8" result="hand" />
            <feDisplacementMap in="SourceGraphic" in2="hand" scale="2.8" xChannelSelector="R" yChannelSelector="G" result="shaky" />
            {/* pressão: onde o ruído largo é alto, o traço engorda */}
            <feMorphology in="shaky" operator="dilate" radius="1.25" result="thick" />
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="1" seed="21" result="press" />
            <feComponentTransfer in="press" result="pressMask">
              <feFuncA type="linear" slope="0" intercept="0" />
              <feFuncR type="discrete" tableValues="0 0 1 1" />
            </feComponentTransfer>
            <feColorMatrix in="pressMask" type="luminanceToAlpha" result="pressAlpha" />
            <feComposite in="thick" in2="pressAlpha" operator="in" result="pressed" />
            <feMerge result="stroke">
              <feMergeNode in="shaky" />
              <feMergeNode in="pressed" />
            </feMerge>
            {/* tinta que incha no papel: desfoca e "recorta" de novo, arredondando as bordas */}
            <feGaussianBlur in="stroke" stdDeviation="0.55" result="soft" />
            <feComponentTransfer in="soft" result="bled">
              <feFuncA type="table" tableValues="0 0.15 0.85 1 1" />
            </feComponentTransfer>
            {/* pigmento irregular (o nanquim não cobre 100% por igual) */}
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.55 1.2" result="grainA" />
            <feComposite in="bled" in2="grainA" operator="in" />
          </filter>
        </svg>
        {/* duas linhas, como numa carta: "Com amor," e embaixo os nomes, maiores */}
        <p className="signature-ink mx-auto mt-9 block w-fit -rotate-3 px-4 pb-3 font-signature leading-[1.3] rtl:leading-[1.8] text-[#221a15]">
          <span className="block text-start" style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.5rem)" }}>
            {sigLead}
          </span>
          <span className="block ps-10" style={{ fontSize: "clamp(2.5rem, 4.8vw, 3.4rem)" }}>
            {sigNames}
          </span>
        </p>
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
