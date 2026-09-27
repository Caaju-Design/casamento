import Link from "next/link";
import { Cloud } from "@/components/atoms/Cloud";
import { Painting } from "@/components/atoms/Painting";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

/**
 * Organism `GiftSection` (#presentes) — "Presenteie os noivos". Card no
 * estilo dos cards de Dress code / RSVP da referência do casal: fundo
 * sálvia claro, título em caixa alta espaçada, fio, subtítulo, uma linha
 * em itálico e botão pílula; à direita, aquarela da Cidade do Cabo com uma
 * frase em caligrafia. O botão leva pra /presentes, que mostra a lista
 * (site externo) dentro do nosso site.
 */
export function GiftSection({ t, locale }: { t: Dictionary["gift"]; locale: Locale }) {
  return (
    <section id="presentes" aria-labelledby="presentes-titulo" className="relative isolate px-6 py-section-gap">
      <Cloud id={8} className="left-[2%] top-4 w-[60vw] md:w-[26vw]" opacity={0.7} />

      <PaintReveal
        variant="rise"
        className="relative mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] bg-salvia-50 shadow-[0_18px_50px_-30px_rgba(45,43,35,0.45)] md:grid-cols-[1.15fr_1fr]"
      >
        <div className="relative z-10 px-8 py-10 md:px-12 md:py-14">
          <h2 id="presentes-titulo" className="font-body text-400 uppercase tracking-[0.2em] text-text-primary sm:tracking-[0.28em]">
            {t.title}
          </h2>
          <span aria-hidden="true" className="mt-4 block h-px w-10 bg-salvia-700" />
          <p className="mt-5 font-body text-100 uppercase tracking-[0.24em] text-salvia-800">{t.sub}</p>
          <p className="mt-3 max-w-md font-body text-200 italic leading-relaxed text-text-secondary">
            {t.lead}
          </p>
          <Link
            href={locale === "pt" ? "/presentes" : `/presentes?lang=${locale}`}
            className="mt-7 inline-flex min-h-[44px] items-center gap-3 whitespace-nowrap rounded-pill bg-salvia-800 px-6 font-body text-100 uppercase tracking-[0.12em] text-white sm:px-7 sm:tracking-[0.2em] transition-colors hover:bg-salvia-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus"
          >
            {t.cta} <span aria-hidden="true" className="rtl:-scale-x-100">›</span>
          </Link>
        </div>

        {/* aquarela + frase em caligrafia */}
        <div aria-hidden="true" className="relative min-h-[16rem] md:min-h-0">
          <Painting name="baia-veleiro" behind={false} className="absolute bottom-0 right-4 w-[min(62%,300px)] md:right-8 md:w-[min(78%,300px)]" />
          <Painting name="ramo-canto-dir-cima" behind={false} className="absolute right-0 top-0 w-[7.5rem]" />
          <p
            className="absolute left-8 top-4 z-10 font-display leading-[0.9] text-salvia-700/80 md:left-4 md:top-8"
            style={{ fontSize: "clamp(1.9rem, 3.4vw, 2.6rem)", transform: "rotate(-8deg)" }}
          >
            {t.script[0]}
            <br />
            {t.script[1]}
          </p>
        </div>
      </PaintReveal>
    </section>
  );
}
