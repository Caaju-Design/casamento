"use client";

import { PhotoCollageMoment, type PlacedPhoto } from "@/components/organisms/PhotoCollageMoment";
import {
  VIAGEM_ANGRA_FRAMES,
  VIAGEM_CONCERTO_FRAMES,
  VIAGEM_GALERA_FRAMES,
  VIAGEM_HOPIHARI_FRAMES,
  VIAGEM_NINO_FRAMES,
} from "@/components/three/watercolor/frames";

/**
 * Momento 4 da "Nossa história" — as viagens pra se ver. Texto à esquerda; à
 * direita um mural de cinco fotos pintadas uma sobre a outra conforme a
 * rolagem: Hopi Hari, Angra, a galera à noite, o concerto de velas e o NINO.
 * Manchas (`stains`): focusY maior = mais pro alto da foto (onde estão os rostos).
 */
const PHOTOS: PlacedPhoto[] = [
  {
    frames: VIAGEM_HOPIHARI_FRAMES,
    stains: { focusX: 0.45, focusY: 0.55, spreadX: 0.8, spreadY: 1.15, radius: 1.05 },
    place: "left-[1%] top-[14%] h-[38%] w-[68%] md:left-0 md:top-[9%] md:h-[42%] md:w-[70%]",
  },
  {
    frames: VIAGEM_ANGRA_FRAMES,
    stains: { focusX: 0.5, focusY: 0.42, spreadX: 1.6, spreadY: 1.0, radius: 0.9 },
    place: "right-[1%] top-[12%] h-[44%] w-[40%] md:right-[2%] md:top-[6%] md:h-[50%] md:w-[40%]",
  },
  {
    frames: VIAGEM_GALERA_FRAMES,
    stains: { focusX: 0.5, focusY: 0.55, spreadX: 1.6, spreadY: 1.1, radius: 0.9 },
    place: "bottom-0 left-[1%] h-[52%] w-[36%] md:bottom-[4%] md:left-[2%] md:h-[56%] md:w-[34%]",
  },
  {
    frames: VIAGEM_CONCERTO_FRAMES,
    stains: { focusX: 0.5, focusY: 0.58, spreadX: 1.6, spreadY: 1.0, radius: 0.9 },
    place: "left-[31%] top-[42%] h-[46%] w-[40%] md:left-[30%] md:top-[40%] md:h-[50%] md:w-[40%]",
  },
  {
    frames: VIAGEM_NINO_FRAMES,
    stains: { focusX: 0.5, focusY: 0.55, spreadX: 1.6, spreadY: 1.0, radius: 0.9 },
    place: "bottom-0 right-[1%] h-[46%] w-[36%] md:bottom-[2%] md:right-[3%] md:h-[50%] md:w-[36%]",
  },
];

export function TravelMoment({ text }: { text: string }) {
  return <PhotoCollageMoment text={text} photos={PHOTOS} photosSide="right" trackVh={380} />;
}
