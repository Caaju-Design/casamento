"use client";

import { PhotoPairMoment } from "@/components/organisms/PhotoPairMoment";
import { CAFE_BALOES_FRAMES, CAFE_SELFIE_FRAMES } from "@/components/three/watercolor/frames";

/**
 * Momento 3 da "Nossa história" — a viagem com os amigos, o café, o passeio e
 * o beijo antes do forró. Mesma ideia da tela anterior, espelhada pra dar
 * ritmo: fotos à ESQUERDA (a dos balões neon primeiro, a selfie dos dois
 * pintada por cima) e texto à direita.
 */
export function CafeMoment({ text }: { text: string }) {
  return (
    <PhotoPairMoment
      text={text}
      photosSide="left"
      // foto 1 (paisagem): rostos da Gabi e do Emanuel, um pouco à direita do centro
      first={{ frames: CAFE_BALOES_FRAMES, stains: { focusX: 0.55, focusY: 0.52, spreadX: 0.7, spreadY: 1.05, radius: 0.95 } }}
      // foto 2 (retrato): os dois rostos no terço de cima
      second={{ frames: CAFE_SELFIE_FRAMES, stains: { focusX: 0.56, focusY: 0.6, spreadX: 1.5, spreadY: 0.8, radius: 0.75 } }}
    />
  );
}
