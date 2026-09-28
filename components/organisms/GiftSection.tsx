import Link from "next/link";
import { Cloud } from "@/components/atoms/Cloud";
import { Painting } from "@/components/atoms/Painting";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

/**
 * Organism `GiftSection` (#presentes) — "Presenteie os noivos". Card no
 * estilo dos cards de Dress code / RSVP da referência do casal: fundo
 * sálvia claro, título em caixa alta espaçada, fio, subtítulo, uma linha
 * em itálico e botão pílula (só o texto); à direita, uma aquarela grande
 * da baía com veleiros. O botão leva pra /presentes, que mostra a lista
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
            {t.cta}
          </Link>
        </div>

        {/* aquarela da baía com veleiros, grande, ocupando o lado direito */}
        <div aria-hidden="true" className="relative flex items-center justify-center px-4 pb-8 md:py-6 md:pe-6 md:ps-0">
          <Painting name="baia-veleiro-topo" behind={false} className="relative h-auto w-full max-w-[34rem] mix-blend-multiply" />
          <Painting name="ramo-canto-dir-cima" behind={false} className="absolute right-0 top-0 w-[6.5rem] md:w-[7.5rem]" />
        </div>
      </PaintReveal>
    </section>
  );
}
