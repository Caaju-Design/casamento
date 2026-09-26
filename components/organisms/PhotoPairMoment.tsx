"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import type { SceneFrames } from "@/components/three/WatercolorScene";
import type { StainPreset } from "@/components/three/watercolor/engine";
import { useTrackProgress } from "@/lib/hooks/useTrackProgress";

const WatercolorScene = dynamic(
  () => import("@/components/three/WatercolorScene").then((m) => m.WatercolorScene),
  { ssr: false },
);

export type PaintedPhoto = {
  frames: SceneFrames;
  stains: StainPreset;
  /** Quando o painel corta as laterais da foto, qual coluna fica no centro (padrão 0,5). */
  focusU?: number;
};

export interface PhotoPairMomentProps {
  text: string;
  /** Pintada primeiro (paisagem, 4:3): ocupa o alto do painel. */
  first: PaintedPhoto;
  /** Pintada depois, POR CIMA da primeira (retrato, 9:16): embaixo, no canto de fora. */
  second: PaintedPhoto;
  /** Lado das fotos no desktop. O texto fica do outro lado. */
  photosSide: "left" | "right";
  /** Troca a posição padrão da primeira foto (classes absolutas, mobile + md:). */
  firstPlace?: string;
  /** Troca a posição padrão da segunda foto (classes absolutas, mobile + md:). */
  secondPlace?: string;
}

const TRACK_VH = 240;
const TEXT_STYLE = { fontSize: "clamp(1.4rem, 2.4vw, 2.25rem)" } as const;

/**
 * Tela da "Nossa história" com duas fotos pintadas em aquarela, uma sobre a
 * outra, amarradas à rolagem (mesma técnica do hero). A primeira foto é
 * pintada de 0 a 42% do trilho; a segunda, de 46% a 88%, por cima dela
 * (canvas transparente fora da tinta, então a primeira continua aparecendo
 * em volta). Texto do outro lado. No celular: fotos em cima e texto embaixo,
 * numa tela só.
 */
export function PhotoPairMoment({ text, first, second, photosSide, firstPlace, secondPlace }: PhotoPairMomentProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useTrackProgress(trackRef);
  const right = photosSide === "right";

  return (
    <div ref={trackRef} className="relative" style={{ height: `${TRACK_VH}vh` }}>
      <div className={["sticky top-0 flex h-[100svh] flex-col-reverse", right ? "md:flex-row" : "md:flex-row-reverse"].join(" ")}>
        <div className="flex flex-1 items-start justify-center px-8 pb-8 pt-6 md:w-1/2 md:items-center md:px-16 md:py-0">
          <PaintReveal variant="rise" delay={500} className="max-w-xl">
            <p
              className={["text-center font-display italic leading-snug text-text-primary", right ? "md:text-right" : "md:text-left"].join(" ")}
              style={TEXT_STYLE}
            >
              {text}
            </p>
          </PaintReveal>
        </div>

        <div className="relative h-[60%] w-full shrink-0 md:h-full md:w-1/2">
          <WatercolorScene
            frames={first.frames}
            progressRef={progressRef}
            stains={first.stains}
            focusU={first.focusU}
            paintStart={0}
            paintCompleteAt={0.42}
            className={
              firstPlace
                ? `!absolute ${firstPlace}`
                : [
                    "!absolute top-[12%] h-[64%] w-[94%] md:top-[8%] md:h-[60%] md:w-[88%]",
                    right ? "left-[2%] md:left-0" : "right-[2%] md:right-0",
                  ].join(" ")
            }
          />
          <WatercolorScene
            frames={second.frames}
            progressRef={progressRef}
            stains={second.stains}
            focusU={second.focusU}
            paintStart={0.46}
            paintCompleteAt={0.88}
            intro={false}
            transparent
            edgeFade={0.09}
            className={
              secondPlace
                ? `!absolute ${secondPlace}`
                : [
                    "!absolute bottom-0 h-[66%] w-[50%] md:bottom-[4%] md:h-[74%] md:w-[42%]",
                    right ? "right-[3%] md:right-[6%]" : "left-[3%] md:left-[6%]",
                  ].join(" ")
            }
          />
        </div>
      </div>
    </div>
  );
}
