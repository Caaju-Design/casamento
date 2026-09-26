import { PaintReveal } from "@/components/molecules/PaintReveal";
import { CapeTownMoment } from "@/components/organisms/CapeTownMoment";
import { FriendMoment } from "@/components/organisms/FriendMoment";
import { CafeMoment } from "@/components/organisms/CafeMoment";

/**
 * Organism `StorySection` — "Nossa história", logo depois do hero.
 *
 * Sete telas, uma por momento (sem a linha de timeline da versão anterior):
 *  1. título, centralizado;
 *  2. Cape Town — vídeo do voo sobre a cidade sendo pintado em aquarela
 *     (mesma técnica do hero, amarrada à rolagem) à esquerda e texto à
 *     direita (CapeTownMoment);
 *  3. a amiga cupido — duas fotos pintadas em aquarela, uma sobre a outra,
 *     à direita e texto à esquerda (FriendMoment);
 *  4. café e forró — mesma ideia, espelhada: fotos à esquerda (CafeMoment);
 *  5–7. demais momentos com as ilustrações estáticas em aquarela
 *     (scripts/aquarela/historia.py), que aparecem "sendo pintadas".
 * As ilustrações têm fundo branco e usam `mix-blend-mode: multiply` no
 * mesmo elemento da máscara, então só a tinta aparece sobre o papel.
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

function Illustration({ src, alt }: { src: string; alt: string }) {
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
        loading="lazy"
        decoding="async"
        className="h-auto w-full"
      />
    </PaintReveal>
  );
}

const TEXT_STYLE = { fontSize: "clamp(1.4rem, 2.4vw, 2.25rem)" } as const;

/** Organism `StorySection` — a história do casal, uma tela por momento. */
export function StorySection() {
  const [capeTown, friend, cafe, ...rest] = CHAPTERS;
  return (
    <section id="historia" aria-labelledby="historia-titulo" className="relative">
      {/* 1 · título */}
      <div className="flex min-h-[100svh] items-center justify-center px-6 py-section-gap">
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
      </div>

      {/* 2 · Cape Town (vídeo em aquarela + texto) */}
      {capeTown && <CapeTownMoment text={capeTown.text} />}

      {/* 3 · a amiga cupido (duas fotos pintadas, uma sobre a outra + texto) */}
      {friend && <FriendMoment text={friend.text} />}

      {/* 4 · café e forró (duas fotos pintadas, uma sobre a outra, espelhado) */}
      {cafe && <CafeMoment text={cafe.text} />}

      {/* 5–6 · demais momentos, uma tela cada */}
      {rest.map((chapter, i) => {
        const imageFirst = i % 2 === 1;
        return (
          <div
            key={chapter.image}
            className="mx-auto grid min-h-[100svh] max-w-6xl content-center items-center gap-8 px-6 py-16 md:grid-cols-2 md:gap-16"
          >
            <div className={imageFirst ? "md:order-1" : "md:order-2"}>
              <Illustration src={chapter.image} alt={chapter.alt} />
            </div>
            <PaintReveal
              variant="rise"
              delay={350}
              className={["text-center", imageFirst ? "md:order-2 md:text-left" : "md:order-1 md:text-right"].join(" ")}
            >
              <p className="font-display italic leading-snug text-text-primary" style={TEXT_STYLE}>
                {chapter.text}
              </p>
            </PaintReveal>
          </div>
        );
      })}

      {/* 7 · fechamento */}
      <div className="mx-auto flex min-h-[100svh] max-w-3xl flex-col items-center justify-center gap-8 px-6 py-16 text-center">
        <div className="w-full max-w-md">
          <Illustration src={CLOSING.image} alt={CLOSING.alt} />
        </div>
        <PaintReveal variant="rise" delay={350}>
          <p className="font-display italic leading-snug text-text-primary" style={{ fontSize: "clamp(1.6rem, 3vw, 2.5rem)" }}>
            {CLOSING.text}
          </p>
        </PaintReveal>
      </div>
    </section>
  );
}
