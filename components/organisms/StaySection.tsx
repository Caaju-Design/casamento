import { Cloud } from "@/components/atoms/Cloud";
import { Painting } from "@/components/atoms/Painting";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { mapsSearch } from "@/lib/content/maps";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Organism `StaySection` (#hospedagem) — onde se hospedar e como chegar.
 * Texto do casal. Cada lugar abre no Google Maps (no celular, direto no app).
 */

const NEIGHBORHOODS = ["Granja Julieta", "Chácara Santo Antônio", "Várzea de Baixo", "Jardim Caravelas", "Vila Cruzeiro"];

/** Buscas no Maps das referências — na mesma ordem de `t.landmarks`. */
const LANDMARK_QUERIES = [
  "MorumbiShopping, São Paulo",
  "Shopping Parque da Cidade, São Paulo",
  "Carrefour Avenida das Nações Unidas, São Paulo",
  "Estação Granja Julieta, São Paulo",
  "Estação Alto da Boa Vista, São Paulo",
];

const HOTELS = [
  { name: "Intercity Nações Unidas", q: "Intercity Nações Unidas, São Paulo" },
  { name: "Transamerica Executive Chácara Santo Antônio", q: "Transamerica Executive Chácara Santo Antônio, São Paulo" },
  { name: "Novotel São Paulo Berrini", q: "Novotel São Paulo Berrini" },
  { name: "ibis budget São Paulo Morumbi", q: "ibis budget São Paulo Morumbi" },
];


const label = "font-body text-100 uppercase tracking-[0.24em] text-salvia-800";
const body = "font-body text-200 leading-relaxed text-text-secondary";
const place =
  "underline decoration-caramelo-200 decoration-1 underline-offset-4 transition-colors hover:text-terracota-700 hover:decoration-terracota-500";

export function StaySection({ t }: { t: Dictionary["stay"] }) {
  return (
    <section id="hospedagem" aria-labelledby="hospedagem-titulo" className="relative isolate pb-[min(34vw,17rem)] pt-section-gap">
      <Painting name="ramo-borda-dir" className="absolute right-0 top-[6%] hidden w-[10rem] md:block" />
      <Painting name="arvore-pequena" className="absolute left-[3%] top-[10%] hidden w-[10rem] md:block" />
      <Cloud id={4} className="left-0 top-[34%] w-[60vw] md:w-[28vw]" opacity={0.8} />
      <Painting name="faixa-mesa" className="absolute bottom-0 left-1/2 w-[min(100%,780px)] -translate-x-1/2" />
      <Painting name="arbustos-pedras" className="absolute bottom-0 right-0 w-[40vw] max-w-[250px]" />

      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading
          id="hospedagem-titulo"
          eyebrow={t.eyebrow}
          title={t.title}
          lead={t.lead}
        />

        <PaintReveal variant="rise" delay={100} className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
          {NEIGHBORHOODS.map((n) => (
            <span key={n} className="rounded-pill border border-salvia-500/70 bg-page/80 px-4 py-1.5 font-body text-100 text-salvia-800">
              {n}
            </span>
          ))}
        </PaintReveal>

        <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-14">
          <PaintReveal variant="rise" delay={150}>
            <h3 className={label}>{t.airbnbTitle}</h3>
            <p className={`${body} mt-2`}>
              {t.airbnb}
            </p>
            <h3 className={`${label} mt-7`}>{t.landmarksTitle}</h3>
            <ul className={`${body} mt-2 space-y-1.5`}>
              {t.landmarks.map((name, i) => (
                <li key={name}>
                  <a className={place} href={mapsSearch(LANDMARK_QUERIES[i] ?? name)} target="_blank" rel="noopener noreferrer">
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </PaintReveal>

          <PaintReveal variant="rise" delay={300}>
            <h3 className="font-display text-600 leading-tight text-text-primary">{t.hotelsTitle}</h3>
            <p className={`${body} mt-1`}>{t.hotelsLead}</p>
            <ul className={`${body} mt-3 space-y-1.5`}>
              {HOTELS.map((h) => (
                <li key={h.name}>
                  <a className={place} href={mapsSearch(h.q)} target="_blank" rel="noopener noreferrer">
                    {h.name}
                  </a>
                </li>
              ))}
            </ul>
          </PaintReveal>
        </div>

        {/* como chegar */}
        <div className="mt-20">
          <SectionHeading id="como-chegar-titulo" eyebrow={t.arriveEyebrow} title={t.arriveTitle} />
          <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-14">
            <PaintReveal variant="rise" delay={100} className="rounded-card border border-caramelo-100 bg-page/80 p-7 backdrop-blur-[2px]">
              <h3 className="font-display text-600 leading-tight text-text-primary">{t.planeTitle}</h3>
              <p className={`${body} mt-3`}>
                {t.plane[0]}
                <a className={place} href={mapsSearch("Aeroporto de Congonhas, São Paulo")} target="_blank" rel="noopener noreferrer">
                  {t.plane[1]}
                </a>
                {t.plane[2]}
              </p>
            </PaintReveal>
            <PaintReveal variant="rise" delay={250} className="rounded-card border border-caramelo-100 bg-page/80 p-7 backdrop-blur-[2px]">
              <h3 className="font-display text-600 leading-tight text-text-primary">{t.busTitle}</h3>
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
      </div>
    </section>
  );
}
