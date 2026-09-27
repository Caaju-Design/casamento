import { Cloud } from "@/components/atoms/Cloud";
import { Painting } from "@/components/atoms/Painting";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { mapsSearch } from "@/lib/content/maps";

/**
 * Organism `TipsSection` (#dicas) — onde comer e salões/barbearias na
 * região. Texto do casal. Cada lugar abre no Google Maps.
 */

type Place = { name: string; desc: string; q: string };
type Group = { title: string; places: Place[] };

const FOOD: Group[] = [
  {
    title: "Restaurantes e botecos",
    places: [
      {
        name: "Casarão de Minas",
        desc: "Comida mineira para comer no local ou pedir pelo iFood. Nossa dica: os pratos executivos são bem servidos e, dependendo da fome, dão para duas pessoas!",
        q: "Casarão de Minas, São Paulo",
      },
      { name: "Parrilaria Granja Julieta", desc: "Para quem gosta de comida de bar e espetinhos.", q: "Parrilaria Granja Julieta, São Paulo" },
      { name: "Boteco Vila Cruzeiro", desc: "Uma opção para petiscar e conversar sem pressa.", q: "Boteco Vila Cruzeiro, São Paulo" },
      { name: "Boteco São Paulo — Vila Cruzeiro", desc: "Outra alternativa de boteco no bairro.", q: "Boteco São Paulo, Vila Cruzeiro, São Paulo" },
    ],
  },
  {
    title: "Café da manhã ou um lanche",
    places: [
      { name: "Padaria Flor das Américas", desc: "Para tomar um café e fazer uma pausa para um lanche.", q: "Padaria Flor das Américas, São Paulo" },
      {
        name: "Giga",
        desc: "Além de mercado, tem padaria. Prático para tomar um café e aproveitar para comprar o que precisar para a hospedagem.",
        q: "Giga, Chácara Santo Antônio, São Paulo",
      },
    ],
  },
  {
    title: "Shoppings e praças de alimentação",
    places: [
      { name: "Shopping Parque da Cidade", desc: "Opções de refeições, lanches e cafés.", q: "Shopping Parque da Cidade, São Paulo" },
      { name: "MorumbiShopping", desc: "Praça de alimentação e uma variedade de restaurantes.", q: "MorumbiShopping, São Paulo" },
      { name: "Shopping Market Place", desc: "Praça de alimentação e restaurantes, pertinho do MorumbiShopping.", q: "Shopping Market Place, São Paulo" },
    ],
  },
];

const BEAUTY: Group[] = [
  {
    title: "Cabelo, maquiagem e unhas",
    places: [
      { name: "Ritualle Bem Estar", desc: "Vila Cruzeiro — salão de beleza e estética na região.", q: "Ritualle Bem Estar, Vila Cruzeiro, São Paulo" },
      { name: "Geff Lima", desc: "Granja Julieta — salão especializado em cabelos e mechas, na Rua Booker Pittman, 57.", q: "Geff Lima, Rua Booker Pittman, 57, São Paulo" },
      {
        name: "Jacques Janine",
        desc: "Granja Julieta — escova, penteados, maquiagem, manicure e pedicure. Também oferece corte masculino e barba.",
        q: "Jacques Janine Granja Julieta, São Paulo",
      },
      {
        name: "Espaço Dharma",
        desc: "Vila Cruzeiro — serviços de cabelo, escova, manicure e pedicure. Também conta com barbearia.",
        q: "Espaço Dharma, Vila Cruzeiro, São Paulo",
      },
    ],
  },
  {
    title: "Barbearias",
    places: [
      { name: "Tarantino", desc: "Chácara Santo Antônio — corte de cabelo, barba e visagismo.", q: "Barbearia Tarantino, Chácara Santo Antônio, São Paulo" },
      { name: "Corleone", desc: "MorumbiShopping — corte de cabelo e cuidados com a barba.", q: "Barbearia Corleone, MorumbiShopping, São Paulo" },
    ],
  },
];

function PlaceList({ group, delay }: { group: Group; delay: number }) {
  return (
    <PaintReveal variant="rise" delay={delay} className="rounded-card border border-caramelo-100 bg-page/80 p-7 backdrop-blur-[2px]">
      <h4 className="font-body text-100 uppercase tracking-[0.24em] text-salvia-800">{group.title}</h4>
      <ul className="mt-4 space-y-4">
        {group.places.map((p) => (
          <li key={p.name}>
            <a
              href={mapsSearch(p.q)}
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

export function TipsSection() {
  return (
    <section id="dicas" aria-labelledby="dicas-titulo" className="relative isolate overflow-hidden py-section-gap">
      <Painting name="ramo-solto" className="absolute left-[2%] top-[3%] w-[26vw] max-w-[170px]" />
      <Painting name="ramo-canto-dir-baixo-2" className="absolute right-0 top-[46%] w-[26vw] max-w-[150px]" />
      <Painting name="folhagem" flip className="absolute bottom-[3%] left-[2%] w-[28vw] max-w-[160px]" />
      <Painting name="arbusto-flor" className="absolute bottom-[2%] right-[4%] w-[18vw] max-w-[110px]" />
      <Cloud id={6} className="right-0 top-[4%] w-[44vw] md:w-[22vw]" />
      <Cloud id={9} className="left-0 top-[52%] w-[32vw] md:w-[14vw]" />

      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading
          id="dicas-titulo"
          eyebrow="Dicas da região"
          title="Onde comer por perto"
          lead="Para quem chegar antes ou ficar mais alguns dias, aqui vão algumas dicas para comer por perto!"
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <PlaceList group={FOOD[0]!} delay={100} />
          <div className="grid gap-6">
            <PlaceList group={FOOD[1]!} delay={200} />
            <PlaceList group={FOOD[2]!} delay={300} />
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center font-body text-100 italic leading-relaxed text-text-secondary">
          Confira os horários antes de sair e, para pedidos por delivery, a disponibilidade de entrega no endereço da sua
          hospedagem.
        </p>

        <div className="mt-20">
          <SectionHeading
            id="beleza-titulo"
            eyebrow="Salões de beleza e barbearias"
            title="Uma ajuda com a produção"
            lead="Quer uma ajuda com a produção para o casamento? Separamos algumas opções na região para consultar e agendar!"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <PlaceList group={BEAUTY[0]!} delay={100} />
            <PlaceList group={BEAUTY[1]!} delay={250} />
          </div>
          <PaintReveal variant="rise" delay={150} className="mx-auto mt-8 max-w-2xl text-center">
            <p className="font-body text-200 leading-relaxed text-text-secondary">
              Agende com antecedência e confirme os serviços, valores e tempo de atendimento. Nosso encontro começa às
              16h, então reserve uma folguinha para se vestir e chegar com calma! 🤍
            </p>
          </PaintReveal>
        </div>
      </div>
    </section>
  );
}
