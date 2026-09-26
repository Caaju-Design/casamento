"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import type { PaintedPhoto } from "@/components/organisms/PhotoPairMoment";
import type { VideoSources } from "@/components/three/WatercolorVideo";
import type { StainPreset } from "@/components/three/watercolor/engine";
import { useTrackProgress } from "@/lib/hooks/useTrackProgress";

const WatercolorScene = dynamic(
  () => import("@/components/three/WatercolorScene").then((m) => m.WatercolorScene),
  { ssr: false },
);
const WatercolorVideo = dynamic(
  () => import("@/components/three/WatercolorVideo").then((m) => m.WatercolorVideo),
  { ssr: false },
);

export type PlacedPhoto = PaintedPhoto & {
  /** Posição/tamanho dentro do painel das fotos (classes absolutas, mobile + md:). */
  place: string;
  /** Margem de papel na borda (padrão 0,07 na primeira e 0,09 nas outras). Menor = a tinta vai mais perto da borda. */
  edgeFade?: number;
};

/** Um vídeo curto no mural: toca sozinho (mudo, em loop) e a rolagem só pinta. */
export type PlacedVideo = {
  video: VideoSources;
  stains: StainPreset;
  focusU?: number;
  place: string;
  edgeFade?: number;
};

export type CollageItem = PlacedPhoto | PlacedVideo;

export interface PhotoCollageMomentProps {
  text: string;
  /** Na ordem em que são pintadas; cada uma cai por cima das anteriores. */
  photos: CollageItem[];
  /** Lado das fotos no desktop. O texto fica do outro lado. */
  photosSide: "left" | "right";
  /** Altura do trilho de rolagem (mais fotos → trilho mais longo). */
  trackVh?: number;
}

const TEXT_STYLE = { fontSize: "clamp(1.4rem, 2.4vw, 2.25rem)" } as const;
/** Fração do trilho usada pra pintar (o resto é respiro com tudo pintado). */
const PAINT_SPAN = 0.9;
/** Quanto a pintura de uma foto invade a janela da próxima (fica mais fluido). */
const OVERLAP = 0.35;

/**
 * Tela da "Nossa história" com várias fotos (e vídeos curtos) pintados em aquarela, uma caindo
 * sobre a outra como um mural de viagem, amarradas à rolagem (mesma técnica
 * das telas de duas fotos). Cada foto tem a sua janela do trilho; a primeira
 * é opaca (papel) e as demais têm canvas transparente fora da tinta, então as
 * de baixo continuam aparecendo em volta. No celular: fotos em cima e texto
 * embaixo, numa tela só.
 */
export function PhotoCollageMoment({ text, photos, photosSide, trackVh = 380 }: PhotoCollageMomentProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useTrackProgress(trackRef);
  const right = photosSide === "right";
  const slot = PAINT_SPAN / Math.max(1, photos.length);

  return (
    <div ref={trackRef} className="relative" style={{ height: `${trackVh}vh` }}>
      <div className={["sticky top-0 flex h-[100svh] pt-[72px] flex-col-reverse", right ? "md:flex-row" : "md:flex-row-reverse"].join(" ")}>
        <div className="flex flex-1 items-start justify-center px-8 pb-8 pt-4 md:w-1/2 md:items-center md:px-16 md:py-0">
          <PaintReveal variant="rise" delay={500} className="max-w-xl">
            <p
              className={["text-center font-display italic leading-snug text-text-primary", right ? "md:text-right" : "md:text-left"].join(" ")}
              style={TEXT_STYLE}
            >
              {text}
            </p>
          </PaintReveal>
        </div>

        <div className="relative h-[54%] w-full shrink-0 md:h-full md:w-1/2">
          {photos.map((photo, i) => {
            const start = i === 0 ? 0 : i * slot - slot * OVERLAP;
            const end = Math.min(PAINT_SPAN, (i + 1) * slot);
            const common = {
              progressRef,
              stains: photo.stains,
              focusU: photo.focusU,
              paintStart: start,
              paintCompleteAt: end,
              intro: i === 0,
              transparent: i > 0,
              edgeFade: photo.edgeFade ?? (i === 0 ? 0.07 : 0.09),
              className: `!absolute ${photo.place}`,
            };
            return "video" in photo ? (
              <WatercolorVideo key={photo.video.desktop} video={photo.video} {...common} />
            ) : (
              <WatercolorScene key={photo.frames.desktop.base} frames={photo.frames} {...common} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
