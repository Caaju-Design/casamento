import { Painting } from "@/components/atoms/Painting";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Organism `PreWeddingSection` (#pre-wedding) — aviso "em breve" das fotos do
 * pré-wedding, no mesmo card do "Presenteie os noivos" (aqui em ardósia, o azul da paleta, pra diferenciar do sálvia do de Presentes;
 * título espaçado, fio, subtítulo e texto em itálico), SEM botão por
 * enquanto. À direita, a outra cena da aquarela da baía (enseada com veleiro).
 * Quando as fotos chegarem, é só trocar por uma galeria ou botão.
 */
export function PreWeddingSection({ t }: { t: Dictionary["prewedding"] }) {
  return (
    <section id="pre-wedding" aria-labelledby="pre-wedding-titulo" className="relative px-6 pb-section-gap">
      <PaintReveal
        variant="rise"
        className="relative mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] bg-ardosia-50 shadow-[0_18px_50px_-30px_rgba(45,43,35,0.45)] md:grid-cols-[1.15fr_1fr]"
      >
        <div className="relative z-10 px-8 py-10 md:px-12 md:py-14">
          <h2 id="pre-wedding-titulo" className="font-body text-400 uppercase tracking-[0.2em] text-text-primary sm:tracking-[0.28em]">
            {t.title}
          </h2>
          <span aria-hidden="true" className="mt-4 block h-px w-10 bg-ardosia-700" />
          <p className="mt-5 max-w-md font-body text-200 italic leading-relaxed text-text-secondary">{t.lead}</p>
          {/* "Em breve" como pílula contornada embaixo do texto (no lugar do botão, enquanto as fotos não chegam) */}
          <span className="mt-7 inline-flex min-h-[44px] items-center rounded-pill border border-ardosia-700 px-6 font-body text-100 uppercase tracking-[0.2em] text-ardosia-800">
            {t.sub}
          </span>
        </div>

        <div aria-hidden="true" className="relative flex items-center justify-center px-4 pb-8 md:py-6 md:pe-6 md:ps-0">
          <Painting name="baia-veleiro-baixo" behind={false} className="relative h-auto w-full max-w-[34rem] mix-blend-multiply" />
          <Painting name="ramo-canto-dir-cima" behind={false} className="absolute right-0 top-0 w-[6.5rem] md:w-[7.5rem]" />
        </div>
      </PaintReveal>
    </section>
  );
}
