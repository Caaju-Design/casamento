"use client";

import { PhotoPairMoment } from "@/components/organisms/PhotoPairMoment";
import { AMIGA_GABI_FRAMES, AMIGA_GRUPO_FRAMES } from "@/components/three/watercolor/frames";

/**
 * Momento 2 da "Nossa história" — a amiga em comum (a cupido). Texto à
 * esquerda; à direita a foto do grupo (Emanuel com as amigas) pintada primeiro
 * e a da Gabi com a amiga pintada por cima.
 */
export function FriendMoment({ text }: { text: string }) {
  return (
    <PhotoPairMoment
      text={text}
      photosSide="right"
      // foto 1 (paisagem): manchas no centro, um pouco pra baixo (rosto do Emanuel)
      first={{ frames: AMIGA_GRUPO_FRAMES, stains: { focusX: 0.5, focusY: 0.45, spreadX: 0.7, spreadY: 1.05, radius: 0.95 } }}
      // foto 2 (retrato): manchas puxadas pro alto, onde estão os rostos
      second={{ frames: AMIGA_GABI_FRAMES, stains: { focusX: 0.5, focusY: 0.62, spreadX: 1.4, spreadY: 0.8, radius: 0.72 } }}
    />
  );
}
