import { Cloud } from "@/components/atoms/Cloud";
import { Painting } from "@/components/atoms/Painting";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { mapsSearch } from "@/lib/content/maps";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Organism `ArriveSection` (#como-chegar) — "Chegando em São Paulo": de avião
 * (Congonhas) e de ônibus (Tietê → metrô). Era a parte de baixo da antiga
 * StaySection; o resto (hospedagem, onde comer, salões) virou o mapa da
 * `AroundSection`.
 */

const body = "font-body text-200 leading-relaxed text-text-secondary";
const place =
  "underline decoration-caramelo-200 decoration-1 underline-offset-4 transition-colors hover:text-terracota-700 hover:decoration-terracota-500";

export function ArriveSection({ t }: { t: Dictionary["stay"] }) {
  return (
    <section id="como-chegar" aria-labelledby="como-chegar-titulo" className="relative isolate pb-[min(34vw,17rem)] pt-8">
      <Cloud id={4} className="left-0 top-[10%] w-[60vw] md:w-[28vw]" opacity={0.8} />
      <Painting name="faixa-mesa" className="absolute bottom-0 left-1/2 w-[min(100%,780px)] -translate-x-1/2" />
      <Painting name="arbustos-pedras" className="absolute bottom-0 right-0 w-[40vw] max-w-[250px]" />

      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading id="como-chegar-titulo" eyebrow={t.arriveEyebrow} title={t.arriveTitle} />
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-14">
            <PaintReveal variant="rise" delay={100} className="rounded-card border border-caramelo-100 bg-page/80 p-7 backdrop-blur-[2px]">
              <h3 className="font-body text-400 font-bold leading-tight text-text-primary">{t.planeTitle}</h3>
              <p className={`${body} mt-3`}>
                {t.plane[0]}
                <a className={place} href={mapsSearch("Aeroporto de Congonhas, São Paulo")} target="_blank" rel="noopener noreferrer">
                  {t.plane[1]}
                </a>
                {t.plane[2]}
              </p>
            </PaintReveal>
            <PaintReveal variant="rise" delay={250} className="rounded-card border border-caramelo-100 bg-page/80 p-7 backdrop-blur-[2px]">
              <h3 className="font-body text-400 font-bold leading-tight text-text-primary">{t.busTitle}</h3>
              <p className={`${body} mt-1`}>{t.busLead}</p>
              <ol className={`${body} mt-3 space-y-2`}>
                {t.busSteps.map((s, i) => (
                  <li key={s} className="flex gap-3">
                    <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-salvia-500/25 font-body text-100 font-bold text-salvia-800">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </PaintReveal>
          </div>
      </div>
    </section>
  );
}
