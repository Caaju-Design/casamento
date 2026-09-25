import { PaintReveal } from "@/components/molecules/PaintReveal";

/**
 * Organism `StorySection` — "Nossa história", logo depois do hero.
 *
 * Mesma estética do hero: cada momento da história tem uma ilustração em
 * aquarela (estática, gerada por scripts/aquarela/historia.py com a paleta
 * oficial) que aparece "sendo pintada" quando entra na tela. As imagens têm
 * fundo branco e entram com `mix-blend-mode: multiply`: o branco vira o
 * papel da página e só a tinta aparece, sem retângulo em volta.
 *
 * No desktop os momentos alternam ilustração à esquerda/direita, ligados
 * por uma rota tracejada (a "volta ao mundo"). No celular fica tudo
 * empilhado: ilustração e depois o texto.
 *
 * Texto escrito pelo casal — não alterar sem pedir pra eles.
 */

type Chapter = { image: string; alt: string; text: string };

const TITLE = "O amor deu uma volta ao mundo para encontrar a gente.";

const CHAPTERS: Chapter[] = [
  {
    image: "/historia/01-cape-town.webp",
    alt: "Aquarela da Table Mountain, na Cidade do Cabo, com dois aviões em rotas que se cruzam sem se encontrar",
    text: "Nossa história começou com um desencontro: estivemos em Cape Town, mas enquanto um voltava para casa, o outro acabava de chegar. Ainda não era a nossa hora.",
  },
  {
    image: "/historia/02-grupo.webp",
    alt: "Aquarela de um celular com mensagens de um grupo, atravessado pela flecha de um cupido com um coração",
    text: "De lá, trouxemos uma grande amiga em comum, que depois nos apresentou do jeito mais despretensioso possível: em um grupo criado por acidente no Instagram. Ela talvez não soubesse, mas estava inaugurando uma carreira de cupido.",
  },
  {
    image: "/historia/03-cafe-e-forro.webp",
    alt: "Aquarela de duas xícaras de café cujo vapor forma um coração, com notas musicais de forró em volta",
    text: "Uma conversa puxou outra, a curiosidade virou vontade de estar perto e um convite para viajar com amigos ganhou outros encantos. Entre um café, um passeio e um beijo antes do forró, começamos a descobrir o que nenhum dos dois tinha planejado.",
  },
  {
    image: "/historia/04-viagens.webp",
    alt: "Aquarela de uma mala com etiqueta de coração e um avião voando entre dois pontos do mapa",
    text: "Vieram as viagens para se ver, a saudade e as conversas sinceras que foram abrindo espaço para o amor. Até que estar juntos deixou de ser o plano para o próximo fim de semana e virou o plano para a vida.",
  },
  {
    image: "/historia/05-mesmo-endereco.webp",
    alt: "Aquarela de uma casinha com janela em forma de coração e dois passarinhos voando juntos",
    text: "O endereço passou a ser o mesmo, os sonhos ganharam um “nós” e, em poucos meses, o casamento já tinha data. Para um começo tão despretensioso, até que aquele grupo rendeu.",
  },
];

const CLOSING = {
  image: "/historia/06-celebrar.webp",
  alt: "Aquarela de duas taças brindando, com confetes nas cores do casamento",
  text: "Agora, queremos reunir quem a gente ama para celebrar essa história — e viver com vocês um pedacinho dela.",
};

function Illustration({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  return (
    // o multiply vai no MESMO elemento da máscara: com a máscara, o grupo vira
    // uma camada isolada e o multiply na <img> de dentro não enxergaria o papel
    <PaintReveal className="w-full" style={{ mixBlendMode: "multiply" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={960}
        height={720}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="h-auto w-full"
      />
    </PaintReveal>
  );
}

/** Organism `StorySection` — a história do casal em momentos ilustrados em aquarela. */
export function StorySection() {
  return (
    <section id="historia" aria-labelledby="historia-titulo" className="relative mx-auto max-w-5xl px-6 py-section-gap">
      <PaintReveal variant="rise" className="mx-auto max-w-3xl text-center">
        <p className="font-body text-100 uppercase tracking-[0.3em] text-text-secondary">Nossa história</p>
        <h2
          id="historia-titulo"
          className="mt-4 font-display italic leading-tight text-text-primary"
          style={{ fontSize: "clamp(2.1rem, 6vw, 3.75rem)" }}
        >
          {TITLE}
        </h2>
      </PaintReveal>

      <ol className="relative mt-16 flex flex-col gap-16 md:mt-24 md:gap-24">
        {/* rota tracejada ligando os momentos (só no desktop) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-10 left-1/2 top-10 hidden -translate-x-1/2 border-l-2 border-dashed border-salvia-500/60 md:block"
        />
        {CHAPTERS.map((chapter, i) => {
          const imageFirst = i % 2 === 0;
          return (
            <li key={chapter.image} className="relative grid items-center gap-6 md:grid-cols-2 md:gap-16">
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 hidden h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-terracota-500 ring-4 ring-page md:block"
              />
              <div className={imageFirst ? "md:order-1" : "md:order-2"}>
                <Illustration src={chapter.image} alt={chapter.alt} priority={i === 0} />
              </div>
              <PaintReveal
                variant="rise"
                delay={350}
                className={["text-center md:text-left", imageFirst ? "md:order-2" : "md:order-1 md:text-right"].join(" ")}
              >
                <p className="font-body text-[1.0625rem] leading-relaxed text-text-primary md:text-[1.125rem]">{chapter.text}</p>
              </PaintReveal>
            </li>
          );
        })}
      </ol>

      <div className="mx-auto mt-20 flex max-w-2xl flex-col items-center gap-6 text-center md:mt-28">
        <div className="w-full max-w-md">
          <Illustration src={CLOSING.image} alt={CLOSING.alt} />
        </div>
        <PaintReveal variant="rise" delay={350}>
          <p className="font-display text-[1.5rem] italic leading-snug text-text-primary md:text-[1.875rem]">{CLOSING.text}</p>
        </PaintReveal>
      </div>
    </section>
  );
}
