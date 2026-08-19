import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";

interface Recommendation {
  nome: string;
  categoria: "Hospedagem" | "Restaurante";
  descricao: string;
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    nome: "Pousada a definir",
    categoria: "Hospedagem",
    descricao: "Uma sugestão de hospedagem próxima ao local da celebração, com condição especial para convidados.",
  },
  {
    nome: "Hotel a definir",
    categoria: "Hospedagem",
    descricao: "Opção mais próxima do centro, ideal para quem chega de longe.",
  },
  {
    nome: "Restaurante a definir",
    categoria: "Restaurante",
    descricao: "Um lugar querido pelo casal para quem quiser jantar antes ou depois da festa.",
  },
];

/** Organism `RecommendationsSection` (hospedagem/restaurantes) — home. */
export function RecommendationsSection() {
  return (
    <section id="recomendacoes" className="mx-auto max-w-4xl px-6 py-section-gap">
      <Heading className="text-center">Hospedagem e restaurantes</Heading>
      <Text tone="secondary" className="mx-auto mt-4 max-w-xl text-center">
        Algumas sugestões para tornar sua estadia ainda mais especial. Conteúdo definitivo em breve — o casal
        ainda está escolhendo os lugares favoritos.
      </Text>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {RECOMMENDATIONS.map((item) => (
          <div key={item.nome} className="rounded-card border border-border-subtle bg-surface p-card-padding">
            <Text tone="secondary" className="text-100 uppercase tracking-wide">
              {item.categoria}
            </Text>
            <Heading as="h3" size="sm" className="mt-2">
              {item.nome}
            </Heading>
            <Text tone="secondary" className="mt-2 text-100">
              {item.descricao}
            </Text>
          </div>
        ))}
      </div>
    </section>
  );
}
