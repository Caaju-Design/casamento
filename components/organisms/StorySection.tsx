import { Cloud } from "@/components/atoms/Cloud";
import type { Dictionary } from "@/lib/i18n/dictionaries";
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
 * Texto escrito pelo casal (lib/i18n/dictionaries.ts, `story`) — não alterar
 * o português sem pedir pra eles.
 */

/** Organism `StorySection` — a história do casal, uma tela por momento. */
export function StorySection({ t }: { t: Dictionary["story"] }) {
  const [capeTown, friend, cafe, viagens, endereco] = t.chapters;
  return (
    <section id="historia" aria-labelledby="historia-titulo" className="relative">
      {/* 1 · título */}
      <div className="relative isolate flex min-h-[100svh] items-center justify-center px-6 py-section-gap">
        <Cloud id={3} className="right-0 top-0 w-[46vw] md:w-[24vw]" />
        <Cloud id={5} className="left-[6%] top-[20%] w-[46vw] md:w-[26vw]" opacity={0.8} />
        <Cloud id={9} className="bottom-[6%] left-0 w-[36vw] md:w-[18vw]" />
        <PaintReveal variant="rise" className="mx-auto max-w-3xl text-center">
          <p className="font-body text-100 uppercase tracking-[0.3em] text-text-secondary">{t.eyebrow}</p>
          <h2
            id="historia-titulo"
            className="mt-4 font-display italic leading-tight text-text-primary"
            style={{ fontSize: "clamp(2.1rem, 6vw, 3.75rem)" }}
          >
            {t.title}
          </h2>
        </PaintReveal>
      </div>

      {/* 2 · Cape Town (vídeo em aquarela + texto) */}
      <CapeTownMoment text={capeTown} />

      {/* 3 · a amiga cupido (duas fotos pintadas, uma sobre a outra + texto) */}
      <FriendMoment text={friend} />

      {/* 4 · café e forró (mural amontoado de sete fotos) */}
      <CafeMoment text={cafe} />

      {/* 5 · as viagens (mural de cinco fotos pintadas) */}
      <TravelMoment text={viagens} />

      {/* 6 · o mesmo endereço (dois vídeos tocando juntos, em aquarela) */}
      <HomeMoment text={endereco} />

      {/* 7 · fechamento — só o texto, uma tela, mesma tipografia do título */}
      <div className="relative isolate flex min-h-[100svh] items-center justify-center px-6 py-section-gap">
        <Cloud id={8} className="left-[3%] top-[14%] w-[62vw] md:w-[32vw]" opacity={0.8} />
        <Cloud id={5} className="right-[8%] top-[8%] w-[40vw] md:w-[20vw]" opacity={0.8} />
        <Cloud id={1} className="bottom-[8%] right-0 w-[30vw] md:w-[16vw]" />
        <PaintReveal variant="rise" className="mx-auto max-w-3xl text-center">
          <p
            className="font-display italic leading-tight text-text-primary"
            style={{ fontSize: "clamp(2.1rem, 6vw, 3.75rem)" }}
          >
            {t.closing}
          </p>
        </PaintReveal>
      </div>
    </section>
  );
}
