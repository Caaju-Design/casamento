"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { AMIGA_GABI_FRAMES, AMIGA_GRUPO_FRAMES } from "@/components/three/watercolor/frames";
import type { StainPreset } from "@/components/three/watercolor/engine";
import { useTrackProgress } from "@/lib/hooks/useTrackProgress";

const WatercolorScene = dynamic(
  () => import("@/components/three/WatercolorScene").then((m) => m.WatercolorScene),
  { ssr: false },
);

/** Foto 1 (paisagem): manchas no centro, um pouco pra baixo (rosto do Emanuel). */
const STAINS_GRUPO: StainPreset = { focusX: 0.5, focusY: 0.45, spreadX: 0.7, spreadY: 1.05, radius: 0.95 };
/** Foto 2 (retrato): manchas puxadas pro alto, onde estão os rostos. */
const STAINS_GABI: StainPreset = { focusX: 0.5, focusY: 0.62, spreadX: 1.4, spreadY: 0.8, radius: 0.72 };

const TRACK_VH = 240;

/**
 * Momento 2 da "Nossa história" — a amiga em comum (a cupido). Uma tela:
 * texto à esquerda, fotos à direita. As duas fotos são pintadas em aquarela
 * com a mesma técnica do hero, uma depois da outra conforme a rolagem:
 * primeiro a foto do grupo (Emanuel com as amigas), depois a da Gabi com a
 * amiga, pintada POR CIMA da primeira (canvas transparente fora da tinta,
 * então a primeira continua aparecendo em volta).
 * No celular: fotos em cima, texto embaixo, numa tela só.
 */
export function FriendMoment({ text }: { text: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useTrackProgress(trackRef);

  return (
    <div ref={trackRef} className="relative" style={{ height: `${TRACK_VH}vh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col-reverse md:flex-row">
        <div className="flex flex-1 items-start justify-center px-8 pb-8 pt-6 md:w-1/2 md:items-center md:px-16 md:py-0">
          <PaintReveal variant="rise" delay={500} className="max-w-xl">
            <p
              className="text-center font-display italic leading-snug text-text-primary md:text-right"
              style={{ fontSize: "clamp(1.4rem, 2.4vw, 2.25rem)" }}
            >
              {text}
            </p>
          </PaintReveal>
        </div>

        <div className="relative h-[60%] w-full shrink-0 md:h-full md:w-1/2">
          {/* foto 1: o grupo — ocupa o alto/esquerda do painel */}
          <WatercolorScene
            frames={AMIGA_GRUPO_FRAMES}
            progressRef={progressRef}
            stains={STAINS_GRUPO}
            paintStart={0}
            paintCompleteAt={0.42}
            className="!absolute left-[2%] top-[12%] h-[64%] w-[94%] md:left-0 md:top-[8%] md:h-[60%] md:w-[88%]"
          />
          {/* foto 2: a Gabi com a amiga — pintada depois, por cima, embaixo/direita */}
          <WatercolorScene
            frames={AMIGA_GABI_FRAMES}
            progressRef={progressRef}
            stains={STAINS_GABI}
            paintStart={0.46}
            paintCompleteAt={0.88}
            intro={false}
            transparent
            edgeFade={0.09}
            className="!absolute bottom-0 right-[3%] h-[66%] w-[50%] md:bottom-[4%] md:right-[6%] md:h-[74%] md:w-[42%]"
          />
        </div>
      </div>
    </div>
  );
}
