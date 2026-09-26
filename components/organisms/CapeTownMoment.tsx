"use client";

import { Cloud } from "@/components/atoms/Cloud";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { useTrackProgress } from "@/lib/hooks/useTrackProgress";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { CAPE_TOWN_FRAMES } from "@/components/three/watercolor/frames";
import type { StainPreset } from "@/components/three/watercolor/engine";

// three.js só no navegador
const WatercolorScene = dynamic(
  () => import("@/components/three/WatercolorScene").then((m) => m.WatercolorScene),
  { ssr: false },
);

/** Manchas centradas (o quadro é quase quadrado): espalhamento parecido nos dois eixos. */
const STAINS: StainPreset = { focusX: 0.5, focusY: 0.5, spreadX: 0.55, spreadY: 0.85, radius: 0.8 };

/** Altura do trilho: a tela fica presa enquanto o voo sobre a cidade acontece. */
const TRACK_VH = 220;

/**
 * Momento 1 da "Nossa história" — Cape Town. Uma tela inteira: à esquerda
 * (50%) o voo de helicóptero sobre a Cidade do Cabo sendo pintado em
 * aquarela, com a mesma técnica do hero (manchas revelando os quadros do
 * vídeo, amarradas à rolagem); à direita (50%) o texto, na mesma tipografia
 * do título da seção, um pouco maior. No celular: pintura em cima, texto
 * embaixo, ainda numa tela só.
 */
export function CapeTownMoment({ text }: { text: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useTrackProgress(trackRef);

  return (
    <div ref={trackRef} className="relative" style={{ height: `${TRACK_VH}vh` }}>
      <div className="sticky top-0 flex h-[100svh] pt-[72px] flex-col md:flex-row">
        <Cloud id={7} className="right-[3%] top-[16%] w-[52vw] md:w-[30vw]" opacity={0.8} />
        <Cloud id={1} className="bottom-[4%] right-0 w-[28vw] md:w-[15vw]" />
        <WatercolorScene
          frames={CAPE_TOWN_FRAMES}
          progressRef={progressRef}
          stains={STAINS}
          paintCompleteAt={0.55}
          className="h-[56%] w-full shrink-0 md:h-full md:w-1/2"
        />
        <div className="flex flex-1 items-center justify-center px-8 pb-10 md:w-1/2 md:px-16 md:pb-0">
          <PaintReveal variant="rise" delay={500} className="max-w-xl">
            <p
              className="text-center font-display italic leading-snug text-text-primary md:text-left"
              style={{ fontSize: "clamp(1.4rem, 2.4vw, 2.25rem)" }}
            >
              {text}
            </p>
          </PaintReveal>
        </div>
      </div>
    </div>
  );
}
