import { Painting } from "@/components/atoms/Painting";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Organism `LiveSection` (#ao-vivo) — pra quem não vai conseguir vir: aviso
 * de que a cerimônia vai ser transmitida ao vivo aqui no site (em breve).
 * Mesmo card do Presentes / Pré-wedding, agora em ardósia (o azul da paleta),
 * com a pílula "Em breve" e uma bolinha "ao vivo" pulsando devagar. Data e
 * hora com fuso (UTC−3) por causa dos convidados de fora do Brasil.
 * Quando o link da transmissão existir, é só trocar a pílula por um botão
 * ou embutir o player.
 */
export function LiveSection({ t }: { t: Dictionary["live"] }) {
  return (
    <section id="ao-vivo" aria-labelledby="ao-vivo-titulo" className="relative isolate px-6 pb-section-gap">
      <PaintReveal
        variant="rise"
        className="relative mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] bg-ardosia-50/45 shadow-[0_18px_50px_-30px_rgba(45,43,35,0.45)] md:grid-cols-[1.15fr_1fr]"
      >
        <div className="relative z-10 px-8 py-10 md:px-12 md:py-14">
          <p className="inline-flex items-center gap-2 font-body text-100 font-bold uppercase tracking-[0.24em] text-ardosia-800">
            <span aria-hidden="true" className="live-dot relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-terracota-500 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-terracota-500" />
            </span>
            {t.eyebrow}
          </p>
          <h2 id="ao-vivo-titulo" className="mt-4 font-body text-400 uppercase tracking-[0.2em] text-text-primary sm:tracking-[0.28em]">
            {t.title}
          </h2>
          <span aria-hidden="true" className="mt-4 block h-px w-10 bg-ardosia-700" />
          <p className="mt-5 max-w-md font-body text-200 italic leading-relaxed text-text-secondary">{t.lead}</p>
          <p className="mt-4 font-body text-100 uppercase tracking-[0.16em] text-ardosia-800">{t.when}</p>
          <span className="mt-7 inline-flex min-h-[44px] items-center rounded-pill border border-ardosia-700 px-6 font-body text-100 uppercase tracking-[0.2em] text-ardosia-800">
            {t.badge}
          </span>
        </div>

        <div aria-hidden="true" className="relative flex items-center justify-center px-4 pb-8 md:py-6 md:pe-6 md:ps-0">
          <Painting name="baia-ilhas" behind={false} className="relative h-auto w-full max-w-[34rem] mix-blend-multiply" />
        </div>
      </PaintReveal>
    </section>
  );
}
