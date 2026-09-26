"use client";

import { PhotoCollageMoment, type CollageItem } from "@/components/organisms/PhotoCollageMoment";
import {
  CAFE_BALOES_FRAMES,
  CAFE_MAR_FRAMES,
  CAFE_NOITE_FRAMES,
  CAFE_SELFIE_FRAMES,
  CAFE_SHOW_FRAMES,
  CAFE_SOL_FRAMES,
  CAFE_TRILHA_FRAMES,
} from "@/components/three/watercolor/frames";

/**
 * Momento 3 da "Nossa história" — a viagem com os amigos, o café, o passeio e
 * o beijo antes do forró. Mural AMONTOADO de 7 fotos à ESQUERDA (texto à
 * direita): primeiro as fotos com os amigos (balões neon, mar, trilha), que
 * ficam por baixo, e por cima as dos dois (selfie, show, sol, noite).
 * As posições tentam deixar sempre os rostos das fotos de baixo à mostra.
 * Manchas (`stains`): focusY maior = mais pro alto da foto.
 */
const ITEMS: CollageItem[] = [
  {
    // balões neon: o amigo com os braços pra cima fica no alto da foto — as
    // manchas sobem e se abrem pra cabeça dele entrar
    frames: CAFE_BALOES_FRAMES,
    stains: { focusX: 0.56, focusY: 0.62, spreadX: 0.85, spreadY: 1.35, radius: 1.12 },
    place: "left-[1%] top-[1%] h-[42%] w-[44%] md:left-[4%] md:top-[3%] md:h-[34%] md:w-[52%]",
  },
  {
    frames: CAFE_MAR_FRAMES,
    stains: { focusX: 0.5, focusY: 0.48, spreadX: 0.95, spreadY: 1.2, radius: 1.1 },
    place: "left-[44%] top-[4%] h-[42%] w-[44%] md:left-[48%] md:top-[10%] md:h-[34%] md:w-[50%]",
  },
  {
    frames: CAFE_TRILHA_FRAMES,
    focusV: 0.4,
    stains: { focusX: 0.52, focusY: 0.52, spreadX: 1.3, spreadY: 1.2, radius: 1.0 },
    place: "left-0 top-[40%] h-[36%] w-[22%] md:left-[2%] md:top-[36%] md:h-[35%] md:w-[30%]",
  },
  {
    // selfie dos dois (foto original, sem esticar): o rosto do Emanuel encosta
    // na borda direita, então a margem de papel dessa foto é mínima e as
    // manchas puxam pra direita
    frames: CAFE_SELFIE_FRAMES,
    focusV: 0.35,
    edgeFade: 0.025,
    stains: { focusX: 0.62, focusY: 0.58, spreadX: 1.8, spreadY: 1.1, radius: 1.15 },
    place: "left-[22%] top-[30%] h-[52%] w-[24%] md:left-[30%] md:top-[30%] md:h-[40%] md:w-[26%]",
  },
  {
    // no show: a Gabi à esquerda, o Emanuel no ALTO à direita — se o painel
    // cortar em cima/embaixo, o corte sai de baixo (focusV) pra não pegar o rosto dele
    frames: CAFE_SHOW_FRAMES,
    focusV: 0.2,
    stains: { focusX: 0.47, focusY: 0.66, spreadX: 1.5, spreadY: 1.3, radius: 1.1 },
    place: "left-[66%] top-[38%] h-[46%] w-[28%] md:left-[58%] md:top-[38%] md:h-[35%] md:w-[30%]",
  },
  {
    // no sol, de óculos escuros
    frames: CAFE_SOL_FRAMES,
    focusV: 0.3,
    stains: { focusX: 0.5, focusY: 0.55, spreadX: 1.4, spreadY: 1.2, radius: 1.0 },
    place: "left-[8%] bottom-0 h-[40%] w-[26%] md:left-[14%] md:bottom-[1%] md:h-[35%] md:w-[30%]",
  },
  {
    // à noite, no restaurante
    frames: CAFE_NOITE_FRAMES,
    focusV: 0.4,
    stains: { focusX: 0.5, focusY: 0.56, spreadX: 1.5, spreadY: 1.1, radius: 1.0 },
    place: "left-[44%] bottom-0 h-[54%] w-[22%] md:left-[50%] md:bottom-[2%] md:h-[40%] md:w-[24%]",
  },
];

export function CafeMoment({ text }: { text: string }) {
  return <PhotoCollageMoment text={text} photos={ITEMS} photosSide="left" trackVh={460} />;
}
