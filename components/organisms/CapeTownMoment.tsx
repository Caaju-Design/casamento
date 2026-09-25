"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useRef } from "react";
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
  const progressRef = useRef(0);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf: number | null = null;
    const update = () => {
      raf = null;
      const rect = track.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      progressRef.current = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
    };
    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={trackRef} className="relative" style={{ height: `${TRACK_VH}vh` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col md:flex-row">
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
