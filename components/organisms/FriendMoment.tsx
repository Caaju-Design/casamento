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
      // foto 1 (paisagem 5:4): a amiga de rosa (a cupido) é a estrela — as
      // manchas puxam pra direita, onde ela está, e se abrem até a borda; se o
      // painel for mais estreito que a foto, o corte sai só da esquerda (focusU 1)
      first={{ frames: AMIGA_GRUPO_FRAMES, focusU: 1, stains: { focusX: 0.66, focusY: 0.6, spreadX: 1.1, spreadY: 1.25, radius: 1.1 } }}
      // foto 2 (retrato): manchas puxadas pro alto, onde estão os rostos
      second={{ frames: AMIGA_GABI_FRAMES, stains: { focusX: 0.5, focusY: 0.62, spreadX: 1.4, spreadY: 0.8, radius: 0.72 } }}
      // no celular: foto 1 mais baixa (livre do header) e quase na proporção
      // da foto (5:4), pra não cortar a cabeça da amiga de rosa
      firstPlace="left-[2%] top-[16%] h-[68%] w-[88%] md:left-0 md:top-[8%] md:h-[60%] md:w-[88%]"
      // foto 2 mais baixa e menor que o padrão, pra não cobrir o rosto e o
      // tronco da amiga de rosa, que fica no canto direito da foto 1
      secondPlace="bottom-0 right-[2%] h-[50%] w-[42%] md:bottom-[2%] md:right-[4%] md:h-[48%] md:w-[36%]"
    />
  );
}
