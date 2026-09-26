import { Cloud } from "@/components/atoms/Cloud";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { AnchorNav } from "@/components/molecules/AnchorNav";
import { HeroSection } from "@/components/organisms/HeroSection";
import { RecommendationsSection } from "@/components/organisms/RecommendationsSection";
import { StorySection } from "@/components/organisms/StorySection";

const NAV_ITEMS = [
  { href: "#historia", label: "Nossa história" },
  { href: "#evento", label: "O evento" },
  { href: "#recomendacoes", label: "Hospedagem e restaurantes" },
];

/** Template `HomePageTemplate` — esqueleto da home one-page. */
export function HomePageTemplate() {
  return (
    <div className="flex flex-col">
      <AnchorNav items={NAV_ITEMS} startHiddenForHero />
      <HeroSection />

      <StorySection />

      <div className="relative isolate overflow-hidden">
        <Cloud id={4} className="left-0 top-[6%] w-[60vw] md:w-[30vw]" />
        <Cloud id={6} className="bottom-[4%] right-0 w-[44vw] md:w-[22vw]" />
        <section
          id="evento"
          className="mx-auto max-w-3xl px-6 py-section-gap text-center"
        >
          <Heading>O evento</Heading>
          <dl className="mx-auto mt-6 grid max-w-md gap-6 text-left sm:grid-cols-2">
            <div>
              <dt className="font-body text-100 uppercase tracking-wide text-text-secondary">
                Data
              </dt>
              <dd className="font-display text-400 text-text-primary">
                17 de abril de 2027
              </dd>
            </div>
            <div>
              <dt className="font-body text-100 uppercase tracking-wide text-text-secondary">
                Horário
              </dt>
              <dd className="font-display text-400 text-text-primary">16h00</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-body text-100 uppercase tracking-wide text-text-secondary">
                Local
              </dt>
              <dd className="font-display text-400 text-text-primary">
                Ed. Square 2 — Salão de festa
                <br />
                Rua Luís Correia de Melo, 86, Chácara Santo Antônio
                <br />
                São Paulo — CEP 04726-220
              </dd>
            </div>
          </dl>
          <Text tone="secondary" className="mx-auto mt-6 max-w-xl">
            Contamos com você para celebrar esse dia com a gente.
          </Text>
        </section>
      </div>

      <div className="relative isolate overflow-hidden">
        <Cloud id={2} className="left-0 top-0 w-[44vw] md:w-[24vw]" />
        <Cloud id={1} className="bottom-[10%] right-0 w-[28vw] md:w-[14vw]" />
        <RecommendationsSection />
      </div>

      <footer className="relative isolate overflow-hidden px-6 py-section-gap text-center">
        <Cloud
          id={7}
          className="left-1/2 top-2 w-[80vw] -translate-x-1/2 md:w-[40vw]"
          opacity={0.8}
        />
        <Text tone="secondary" className="text-100">
          Com amor, Gabriela &amp; Emanuel.
        </Text>
      </footer>
    </div>
  );
}
