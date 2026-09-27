import { Cloud } from "@/components/atoms/Cloud";
import { Painting } from "@/components/atoms/Painting";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { mapsSearch } from "@/lib/content/maps";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Organism `TipsSection` (#dicas) — onde comer e salões/barbearias na
 * região. Texto do casal. Cada lugar abre no Google Maps.
 */

type Group = Dictionary["tips"]["food"][number];

/** Buscas no Maps por nome do lugar (os nomes não mudam entre idiomas). */
const QUERIES: Record<string, string> = {
  "Casarão de Minas": "Casarão de Minas, São Paulo",
  "Parrilaria Granja Julieta": "Parrilaria Granja Julieta, São Paulo",
  "Boteco Vila Cruzeiro": "Boteco Vila Cruzeiro, São Paulo",
  "Boteco São Paulo — Vila Cruzeiro": "Boteco São Paulo, Vila Cruzeiro, São Paulo",
  "Padaria Flor das Américas": "Padaria Flor das Américas, São Paulo",
  Giga: "Giga, Chácara Santo Antônio, São Paulo",
  "Shopping Parque da Cidade": "Shopping Parque da Cidade, São Paulo",
  MorumbiShopping: "MorumbiShopping, São Paulo",
  "Shopping Market Place": "Shopping Market Place, São Paulo",
  "Ritualle Bem Estar": "Ritualle Bem Estar, Vila Cruzeiro, São Paulo",
  "Geff Lima": "Geff Lima, Rua Booker Pittman, 57, São Paulo",
  "Jacques Janine": "Jacques Janine Granja Julieta, São Paulo",
  "Espaço Dharma": "Espaço Dharma, Vila Cruzeiro, São Paulo",
  Tarantino: "Barbearia Tarantino, Chácara Santo Antônio, São Paulo",
  Corleone: "Barbearia Corleone, MorumbiShopping, São Paulo",
};

function PlaceList({ group, delay }: { group: Group; delay: number }) {
  return (
    <PaintReveal variant="rise" delay={delay} className="rounded-card border border-caramelo-100 bg-page/80 p-7 backdrop-blur-[2px]">
      <h4 className="font-body text-100 uppercase tracking-[0.24em] text-salvia-800">{group.title}</h4>
      <ul className="mt-4 space-y-4">
        {group.places.map((p) => (
          <li key={p.name}>
            <a
              href={mapsSearch(QUERIES[p.name] ?? `${p.name}, São Paulo`)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display text-600 leading-tight text-text-primary underline decoration-caramelo-200 decoration-1 underline-offset-4 transition-colors hover:text-terracota-700 hover:decoration-terracota-500"
            >
              {p.name}
            </a>
            <p className="mt-1 font-body text-200 leading-relaxed text-text-secondary">{p.desc}</p>
          </li>
        ))}
      </ul>
    </PaintReveal>
  );
}

export function TipsSection({ t }: { t: Dictionary["tips"] }) {
  return (
    <section id="dicas" aria-labelledby="dicas-titulo" className="relative isolate pb-44 pt-section-gap md:pb-section-gap">
      <Painting name="ramo-solto" className="absolute left-[2%] top-[3%] w-[26vw] max-w-[170px]" />
      <Painting name="ramo-canto-dir-baixo-2" className="absolute right-0 top-[46%] w-[26vw] max-w-[150px]" />
      <Painting name="folhagem" flip className="absolute bottom-[3%] left-[2%] w-[28vw] max-w-[160px]" />
      <Painting name="arbusto-flor" className="absolute bottom-[2%] right-[4%] w-[18vw] max-w-[110px]" />
      <Cloud id={6} className="right-0 top-[4%] w-[44vw] md:w-[22vw]" />
      <Cloud id={9} className="left-0 top-[52%] w-[32vw] md:w-[14vw]" />

      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading
          id="dicas-titulo"
          eyebrow={t.eyebrow}
          title={t.title}
          lead={t.lead}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <PlaceList group={t.food[0]} delay={100} />
          <div className="grid gap-6">
            <PlaceList group={t.food[1]} delay={200} />
            <PlaceList group={t.food[2]} delay={300} />
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center font-body text-100 italic leading-relaxed text-text-secondary">
          {t.foodNote}
        </p>

        <div className="mt-20">
          <SectionHeading
            id="beleza-titulo"
            eyebrow={t.beautyEyebrow}
            title={t.beautyTitle}
            lead={t.beautyLead}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <PlaceList group={t.beauty[0]} delay={100} />
            <PlaceList group={t.beauty[1]} delay={250} />
          </div>
          <PaintReveal variant="rise" delay={150} className="mx-auto mt-8 max-w-2xl text-center">
            <p className="font-body text-200 leading-relaxed text-text-secondary">
              {t.beautyNote}
            </p>
          </PaintReveal>
        </div>
      </div>
    </section>
  );
}
