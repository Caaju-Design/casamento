"use client";

import { Cloud } from "@/components/atoms/Cloud";
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
 * ficam por baixo, e por cima as dos dois (selfie, sol, noite, show).
 * Bem juntinhas, uma invadindo a outra, quase sem papel entre elas.
 * As posições tentam deixar sempre os rostos das fotos de baixo à mostra.
 * Manchas (`stains`): focusY maior = mais pro alto da foto.
 */
const ITEMS: CollageItem[] = [
  {
    // balões neon: o amigo com os braços pra cima fica no alto da foto — as
    // manchas sobem e se abrem pra cabeça dele entrar
    frames: CAFE_BALOES_FRAMES,
    stains: { focusX: 0.56, focusY: 0.62, spreadX: 0.85, spreadY: 1.35, radius: 1.12 },
    place: "left-0 top-0 h-[44%] w-[50%] md:left-[1%] md:top-[1%] md:h-[36%] md:w-[56%]",
  },
  {
    frames: CAFE_MAR_FRAMES,
    stains: { focusX: 0.5, focusY: 0.48, spreadX: 0.95, spreadY: 1.2, radius: 1.1 },
    place: "left-[46%] top-[3%] h-[44%] w-[54%] md:left-[46%] md:top-[5%] md:h-[35%] md:w-[53%]",
  },
  {
    frames: CAFE_TRILHA_FRAMES,
    focusV: 0.4,
    stains: { focusX: 0.52, focusY: 0.52, spreadX: 1.3, spreadY: 1.2, radius: 1.0 },
    place: "left-0 top-[38%] h-[44%] w-[24%] md:left-0 md:top-[32%] md:h-[36%] md:w-[32%]",
  },
  {
    // selfie dos dois (foto original, sem esticar): o rosto do Emanuel encosta
    // na borda direita, então a margem de papel dessa foto é mínima (as
    // "mordidas" finas do motor ainda deixam a borda mastigada)
    frames: CAFE_SELFIE_FRAMES,
    focusV: 0.35,
    edgeFade: 0.03,
    stains: { focusX: 0.62, focusY: 0.58, spreadX: 1.8, spreadY: 1.1, radius: 1.15 },
    place: "left-[20%] top-[34%] h-[58%] w-[24%] md:left-[26%] md:top-[32%] md:h-[43%] md:w-[28%]",
  },
  {
    // no sol, de óculos escuros
    frames: CAFE_SOL_FRAMES,
    focusV: 0.3,
    stains: { focusX: 0.5, focusY: 0.55, spreadX: 1.4, spreadY: 1.2, radius: 1.0 },
    place: "left-0 top-[64%] h-[36%] w-[24%] md:left-[2%] md:top-[62%] md:h-[37%] md:w-[34%]",
  },
  {
    // à noite, no restaurante
    frames: CAFE_NOITE_FRAMES,
    focusV: 0.4,
    stains: { focusX: 0.5, focusY: 0.56, spreadX: 1.5, spreadY: 1.1, radius: 1.0 },
    place: "left-[43%] top-[45%] h-[55%] w-[24%] md:left-[36%] md:top-[59%] md:h-[41%] md:w-[27%]",
  },
  {
    // no show: a Gabi à esquerda, o Emanuel no ALTO à direita — se o painel
    // cortar em cima/embaixo, o corte sai de baixo (focusV) pra não pegar o
    // rosto dele. É a última: fica por cima de todas
    frames: CAFE_SHOW_FRAMES,
    focusV: 0.2,
    stains: { focusX: 0.47, focusY: 0.66, spreadX: 1.5, spreadY: 1.3, radius: 1.1 },
    place: "left-[62%] top-[40%] h-[60%] w-[38%] md:left-[54%] md:top-[34%] md:h-[60%] md:w-[45%]",
  },
];

export function CafeMoment({ text }: { text: string }) {
  return <PhotoCollageMoment
      text={text}
      photos={ITEMS}
      photosSide="left"
      trackVh={460}
      decor={
        <>
          <Cloud id={6} className="right-0 top-[14%] w-[42vw] md:w-[24vw]" />
          <Cloud id={8} className="bottom-[2%] right-[2%] w-[58vw] md:w-[30vw]" opacity={0.8} />
        </>
      }
    />;
}
