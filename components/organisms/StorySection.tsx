import { Cloud } from "@/components/atoms/Cloud";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { CapeTownMoment } from "@/components/organisms/CapeTownMoment";
import { FriendMoment } from "@/components/organisms/FriendMoment";
import { CafeMoment } from "@/components/organisms/CafeMoment";
import { TravelMoment } from "@/components/organisms/TravelMoment";
import { HomeMoment } from "@/components/organisms/HomeMoment";

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
 *  5. as viagens — mural com cinco fotos pintadas uma sobre a outra, fotos
 *     à direita (TravelMoment);
 *  6. o mesmo endereço — dois vídeos de 15 s tocando juntos, pintados em
 *     aquarela, à esquerda (HomeMoment);
 *  7. fechamento — só o texto, centralizado numa tela, como o título.
 *
 * Texto escrito pelo casal — não alterar sem pedir pra eles.
 */

type Chapter = { text: string };

const TITLE = "O amor deu uma volta ao mundo para encontrar a gente.";

const CHAPTERS: Chapter[] = [
  {
    text: "Nossa história começou com um desencontro: estivemos em Cape Town, mas enquanto um voltava para casa, o outro acabava de chegar. Ainda não era a nossa hora.",
  },
  {
    text: "De lá, trouxemos uma grande amiga em comum, que depois nos apresentou do jeito mais despretensioso possível: em um grupo criado por acidente no Instagram. Ela talvez não soubesse, mas estava inaugurando uma carreira de cupido.",
  },
  {
    text: "Uma conversa puxou outra, a curiosidade virou vontade de estar perto e um convite para viajar com amigos ganhou outros encantos. Entre um café, um passeio e um beijo antes do forró, começamos a descobrir o que nenhum dos dois tinha planejado.",
  },
  {
    text: "Vieram as viagens para se ver, a saudade e as conversas sinceras que foram abrindo espaço para o amor. Até que estar juntos deixou de ser o plano para o próximo fim de semana e virou o plano para a vida.",
  },
  {
    text: "O endereço passou a ser o mesmo, os sonhos ganharam um “nós” e, em poucos meses, o casamento já tinha data. Para um começo tão despretensioso, até que aquele grupo rendeu.",
  },
];

/** Fechamento: só o texto, centralizado numa tela, igual ao título. */
const CLOSING = "Agora, queremos reunir quem a gente ama para celebrar essa história — e viver com vocês um pedacinho dela.";

/** Organism `StorySection` — a história do casal, uma tela por momento. */
export function StorySection() {
  const [capeTown, friend, cafe, viagens, endereco] = CHAPTERS;
  return (
    <section id="historia" aria-labelledby="historia-titulo" className="relative">
      {/* 1 · título */}
      <div className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-6 py-section-gap">
        <Cloud id={3} className="right-0 top-0 w-[46vw] md:w-[24vw]" />
        <Cloud id={5} className="left-[6%] top-[20%] w-[46vw] md:w-[26vw]" opacity={0.8} />
        <Cloud id={9} className="bottom-[6%] left-0 w-[36vw] md:w-[18vw]" />
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

      {/* 4 · café e forró (mural amontoado de sete fotos) */}
      {cafe && <CafeMoment text={cafe.text} />}

      {/* 5 · as viagens (mural de cinco fotos pintadas) */}
      {viagens && <TravelMoment text={viagens.text} />}

      {/* 6 · o mesmo endereço (dois vídeos tocando juntos, em aquarela) */}
      {endereco && <HomeMoment text={endereco.text} />}

      {/* 7 · fechamento — só o texto, uma tela, mesma tipografia do título */}
      <div className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-6 py-section-gap">
        <Cloud id={8} className="left-[3%] top-[14%] w-[62vw] md:w-[32vw]" opacity={0.8} />
        <Cloud id={5} className="right-[8%] top-[8%] w-[40vw] md:w-[20vw]" opacity={0.8} />
        <Cloud id={1} className="bottom-[8%] right-0 w-[30vw] md:w-[16vw]" />
        <PaintReveal variant="rise" className="mx-auto max-w-3xl text-center">
          <p
            className="font-display italic leading-tight text-text-primary"
            style={{ fontSize: "clamp(2.1rem, 6vw, 3.75rem)" }}
          >
            {CLOSING}
          </p>
        </PaintReveal>
      </div>
    </section>
  );
}
