import { Cloud } from "@/components/atoms/Cloud";
import { Painting } from "@/components/atoms/Painting";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { ArriveRoutes } from "@/components/organisms/ArriveRoutes";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Organism `ArriveSection` (#como-chegar) — "Chegando em São Paulo": seletor
 * de chegada (Congonhas, Guarulhos, Tietê) com o trajeto de metrô pintado de
 * cada um (`ArriveRoutes` + `MetroRoute`). Era a parte de baixo da antiga
 * StaySection; o resto (hospedagem, onde comer, salões) virou o mapa da
 * `AroundSection`.
 */

export function ArriveSection({ t }: { t: Dictionary["stay"] }) {
  return (
    <section id="como-chegar" aria-labelledby="como-chegar-titulo" className="relative isolate pb-[26vw] pt-8">
      <Cloud id={4} className="left-0 top-[10%] w-[60vw] md:w-[28vw]" opacity={0.8} />
      <Painting name="faixa-mesa" className="absolute bottom-0 left-1/2 w-[90vw] -translate-x-1/2" />
      {/* a árvore do ipê (veio do "O grande dia"), maior, no canto esquerdo */}
      <Painting name="arvore" className="absolute bottom-0 left-0 w-[46vw] max-w-[360px]" />

      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading id="como-chegar-titulo" eyebrow={t.arriveEyebrow} title={t.arriveTitle} highlight />
        <PaintReveal variant="rise" delay={100} className="mt-10">
          <ArriveRoutes t={t.arrival} />
        </PaintReveal>
      </div>
    </section>
  );
}
