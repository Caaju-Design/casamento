"use client";

import { Cloud } from "@/components/atoms/Cloud";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef } from "react";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import type { VideoSources } from "@/components/three/WatercolorVideo";
import type { StainPreset } from "@/components/three/watercolor/engine";
import { useTrackProgress } from "@/lib/hooks/useTrackProgress";

const WatercolorVideo = dynamic(
  () => import("@/components/three/WatercolorVideo").then((m) => m.WatercolorVideo),
  { ssr: false },
);

/** Trechos de 15 s escolhidos nos vídeos do casal (os momentos mais felizes). */
const CARRO: VideoSources = {
  desktop: "/historia/endereco/carro-d",
  mobile: "/historia/endereco/carro-m",
  poster: "/historia/endereco/carro-poster.webp",
  aspect: 16 / 9,
};
const SOFA: VideoSources = {
  desktop: "/historia/endereco/sofa-d",
  mobile: "/historia/endereco/sofa-m",
  poster: "/historia/endereco/sofa-poster.webp",
  aspect: 16 / 9,
};
const CARRO_STAINS: StainPreset = { focusX: 0.42, focusY: 0.52, spreadX: 0.8, spreadY: 1.15, radius: 1.05 };
const SOFA_STAINS: StainPreset = { focusX: 0.5, focusY: 0.5, spreadX: 0.8, spreadY: 1.15, radius: 1.05 };

const TRACK_VH = 260;
const TEXT_STYLE = { fontSize: "clamp(1.4rem, 2.4vw, 2.25rem)" } as const;
/** Diferença (s) a partir da qual o segundo vídeo é realinhado ao primeiro. */
const MAX_DRIFT = 0.25;

/**
 * Momento 5 da "Nossa história" — o mesmo endereço. Dois vídeos tocando AO
 * MESMO TEMPO (a estrada e o sofá de casa com o ukulele), pintados em
 * aquarela pela rolagem, um sobre o outro, à ESQUERDA; texto à direita.
 * Os dois têm 15 s e ficam sincronizados: o do carro é o "maestro" e o do
 * sofá é realinhado se escorregar.
 */
export function HomeMoment({ text }: { text: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useTrackProgress(trackRef);
  const videos = useRef<[HTMLVideoElement | null, HTMLVideoElement | null]>([null, null]);

  const setLeader = useCallback((el: HTMLVideoElement | null) => {
    videos.current[0] = el;
  }, []);
  const setFollower = useCallback((el: HTMLVideoElement | null) => {
    videos.current[1] = el;
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const [a, b] = videos.current;
      if (!a || !b || a.readyState < 2 || b.readyState < 2) return;
      if (a.paused !== b.paused) {
        if (a.paused) b.pause();
        else b.play().catch(() => undefined);
      }
      if (!b.seeking && Math.abs(a.currentTime - b.currentTime) > MAX_DRIFT) b.currentTime = a.currentTime;
    }, 400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div ref={trackRef} className="relative" style={{ height: `${TRACK_VH}vh` }}>
      <div className="sticky top-0 flex h-[100svh] pt-[72px] flex-col-reverse md:flex-row-reverse">
        <Cloud id={3} className="right-0 top-[72px] w-[38vw] md:w-[19vw]" />
        <Cloud id={7} className="bottom-[5%] right-[3%] w-[62vw] md:w-[32vw]" opacity={0.8} />
        <div className="flex flex-1 items-start justify-center px-8 pb-8 pt-4 md:w-1/2 md:items-center md:px-16 md:py-0">
          <PaintReveal variant="rise" delay={500} className="max-w-xl">
            <p className="text-center font-display italic leading-snug text-text-primary md:text-left" style={TEXT_STYLE}>
              {text}
            </p>
          </PaintReveal>
        </div>

        <div className="relative h-[54%] w-full shrink-0 md:h-full md:w-1/2">
          <WatercolorVideo
            video={CARRO}
            progressRef={progressRef}
            stains={CARRO_STAINS}
            paintStart={0}
            paintCompleteAt={0.4}
            onVideo={setLeader}
            className="!absolute left-[1%] top-[2%] h-[50%] w-[82%] md:left-[2%] md:top-[5%] md:h-[46%] md:w-[88%]"
          />
          <WatercolorVideo
            video={SOFA}
            progressRef={progressRef}
            stains={SOFA_STAINS}
            paintStart={0.3}
            paintCompleteAt={0.75}
            intro={false}
            transparent
            edgeFade={0.09}
            onVideo={setFollower}
            className="!absolute bottom-0 right-[1%] h-[50%] w-[82%] md:bottom-[5%] md:right-[2%] md:h-[46%] md:w-[88%]"
          />
        </div>
      </div>
    </div>
  );
}
