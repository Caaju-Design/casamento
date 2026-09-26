"use client";

import { PhotoCollageMoment, type CollageItem } from "@/components/organisms/PhotoCollageMoment";
import {
  CAFE_BALOES_FRAMES,
  CAFE_MAR_FRAMES,
  CAFE_SELFIE_FRAMES,
  CAFE_TRILHA_FRAMES,
} from "@/components/three/watercolor/frames";

/**
 * Momento 3 da "Nossa história" — a viagem com os amigos, o café, o passeio e
 * o beijo antes do forró. Mural espelhado em relação às telas vizinhas: fotos
 * à ESQUERDA e texto à direita. Ordem da pintura: balões neon → selfie dos
 * dois → mergulho com as amigas → a galera na trilha → e, fechando, o vídeo
 * dos dois dançando (toca sozinho, mudo, em loop).
 * Manchas (`stains`): focusY maior = mais pro alto da foto.
 */
const ITEMS: CollageItem[] = [
  {
    frames: CAFE_BALOES_FRAMES,
    stains: { focusX: 0.55, focusY: 0.52, spreadX: 0.8, spreadY: 1.1, radius: 1.0 },
    place: "left-[1%] top-[3%] h-[36%] w-[56%] md:left-[2%] md:top-[4%] md:h-[35%] md:w-[58%]",
  },
  {
    // selfie dos dois: o rosto do Emanuel encostava na borda direita da foto
    // (a imagem foi estendida à direita). Corte lateral sai da esquerda
    // (focusU) e as manchas cobrem os dois rostos, um pouco pra direita
    frames: CAFE_SELFIE_FRAMES,
    focusU: 0.7,
    stains: { focusX: 0.56, focusY: 0.58, spreadX: 1.6, spreadY: 1.05, radius: 1.05 },
    place: "right-[1%] top-[1%] h-[42%] w-[30%] md:right-[2%] md:top-[1%] md:h-[48%] md:w-[40%]",
  },
  {
    frames: CAFE_MAR_FRAMES,
    stains: { focusX: 0.5, focusY: 0.45, spreadX: 0.9, spreadY: 1.2, radius: 1.1 },
    place: "left-[2%] top-[44%] h-[30%] w-[50%] md:left-[4%] md:top-[39%] md:h-[31%] md:w-[52%]",
  },
  {
    frames: CAFE_TRILHA_FRAMES,
    stains: { focusX: 0.52, focusY: 0.5, spreadX: 1.3, spreadY: 1.2, radius: 1.0 },
    place: "bottom-0 left-[36%] h-[40%] w-[30%] md:bottom-[2%] md:left-[2%] md:h-[34%] md:w-[32%]",
  },
  {
    video: {
      desktop: "/historia/cafe/forro-d",
      mobile: "/historia/cafe/forro-m",
      poster: "/historia/cafe/forro-poster.webp",
      aspect: 464 / 832,
    },
    stains: { focusX: 0.5, focusY: 0.55, spreadX: 1.5, spreadY: 1.1, radius: 1.0 },
    place: "bottom-0 right-[1%] h-[50%] w-[30%] md:bottom-[2%] md:right-[6%] md:h-[50%] md:w-[32%]",
  },
];

export function CafeMoment({ text }: { text: string }) {
  return <PhotoCollageMoment text={text} photos={ITEMS} photosSide="left" trackVh={380} />;
}
