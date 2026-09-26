"use client";

import { Cloud } from "@/components/atoms/Cloud";
import { PhotoPairMoment } from "@/components/organisms/PhotoPairMoment";
import { AMIGA_GABI_FRAMES, AMIGA_GRUPO_FRAMES } from "@/components/three/watercolor/frames";

/**
 * Momento 2 da "Nossa história" — a amiga em comum (a cupido). Texto à
 * esquerda; à direita a foto do grupo pintada primeiro e a da Gabi com a
 * amiga, GRANDE, pintada por cima.
 *
 * A foto do grupo é ESPELHADA (pedido do Emanuel): a amiga de rosa — a
 * cupido — fica à esquerda, perto do texto, o Emanuel no meio, e as duas
 * outras meninas à direita. A foto da Gabi com a amiga cai justamente por
 * cima dessas duas, deixando a cupido e o Emanuel à mostra.
 */
export function FriendMoment({ text }: { text: string }) {
  return (
    <PhotoPairMoment
      text={text}
      photosSide="right"
      decor={
        <>
          <Cloud id={5} className="left-[4%] top-[18%] w-[40vw] md:w-[22vw]" opacity={0.8} />
          <Cloud id={4} className="bottom-0 left-0 w-[62vw] md:w-[30vw]" />
        </>
      }
      // foto 1 (4:3, espelhada): manchas na cupido (esquerda) e no Emanuel
      // (centro); corte lateral, se houver, sai só da direita (focusU 0)
      first={{ frames: AMIGA_GRUPO_FRAMES, focusU: 0, stains: { focusX: 0.4, focusY: 0.56, spreadX: 1.15, spreadY: 1.2, radius: 1.1 } }}
      // foto 2 (retrato 9:16): as duas de corpo inteiro, rostos no terço de cima
      second={{ frames: AMIGA_GABI_FRAMES, stains: { focusX: 0.5, focusY: 0.58, spreadX: 1.5, spreadY: 1.2, radius: 0.95 } }}
      firstPlace="left-[1%] top-[2%] h-[72%] w-[80%] md:left-0 md:top-[6%] md:h-[58%] md:w-[92%]"
      // grande, por cima do terço direito da foto 1 (as duas outras meninas)
      secondPlace="right-0 top-0 h-[94%] w-[46%] md:right-0 md:top-[3%] md:h-[76%] md:w-[46%]"
    />
  );
}
