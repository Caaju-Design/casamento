import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";
import { AnchorNav } from "@/components/molecules/AnchorNav";
import { HeroSection } from "@/components/organisms/HeroSection";
import { RecommendationsSection } from "@/components/organisms/RecommendationsSection";

const NAV_ITEMS = [
  { href: "#historia", label: "Nossa história" },
  { href: "#evento", label: "O evento" },
  { href: "#recomendacoes", label: "Hospedagem e restaurantes" },
];

/** Template `HomePageTemplate` — esqueleto da home one-page. */
export function HomePageTemplate() {
  return (
    <div className="flex flex-col">
      <AnchorNav items={NAV_ITEMS} />
      <HeroSection />

      <section id="historia" className="mx-auto max-w-3xl px-6 py-section-gap text-center">
        <Heading>Nossa história</Heading>
        <Text tone="secondary" className="mx-auto mt-6 max-w-xl">
          Foi num daqueles encontros que parecem obra do destino que tudo começou. Desde então, construímos,
          dia após dia, uma história feita de cumplicidade, risadas e muito carinho — e agora queremos
          celebrar esse próximo capítulo ao lado de quem a gente ama.
        </Text>
        <Text tone="secondary" className="mx-auto mt-4 max-w-xl">
          (Conteúdo definitivo da nossa história em breve — o casal ainda está escrevendo esse capítulo.)
        </Text>
      </section>

      <section id="evento" className="mx-auto max-w-3xl px-6 py-section-gap text-center">
        <Heading>O evento</Heading>
        <dl className="mx-auto mt-6 grid max-w-md gap-6 text-left sm:grid-cols-2">
          <div>
            <dt className="font-body text-100 uppercase tracking-wide text-text-secondary">Data</dt>
            <dd className="font-display text-400 text-text-primary">17 de abril de 2027</dd>
          </div>
          <div>
            <dt className="font-body text-100 uppercase tracking-wide text-text-secondary">Horário</dt>
            <dd className="font-display text-400 text-text-primary">16h00</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="font-body text-100 uppercase tracking-wide text-text-secondary">Local</dt>
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

      <RecommendationsSection />

      <footer className="px-6 py-section-gap text-center">
        <Text tone="secondary" className="text-100">
          Com amor, Gabriela &amp; Emanuel.
        </Text>
      </footer>
    </div>
  );
}
