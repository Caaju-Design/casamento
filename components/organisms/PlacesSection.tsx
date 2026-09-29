import { PaintReveal } from "@/components/molecules/PaintReveal";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Organism `PlacesSection` (#lugares) — "Lugares que nos formaram", o fecho
 * da página antes do rodapé (arte do manual dos padrinhos): uma aquarela só
 * com a Cidade do Cabo (onde a história começa), Angra e Brasília.
 *
 * A pintura veio do PDF do manual SEM os textos (eles eram texto de verdade
 * no PDF, então deu pra tirar); título, nomes e legenda são HTML por cima,
 * nas mesmas posições da arte — assim traduzem (pt/en/ar) e são lidos por
 * leitor de tela. Tamanhos em `cqw` (largura do quadro) pra acompanharem a
 * pintura em qualquer tela; `max()` segura um mínimo legível no celular.
 * Posições são físicas (left), não espelham no árabe: a pintura não espelha.
 * As bordas da aquarela somem no creme da página com uma máscara suave.
 */

const label = "absolute -translate-x-1/2 text-center";
const name = "block whitespace-nowrap font-body font-bold uppercase tracking-[0.18em] text-caramelo-800 [font-size:max(0.7rem,2.3cqw)]";
const word = "mt-[0.4cqw] block font-body text-text-primary [font-size:max(0.8rem,2.2cqw)]";

export function PlacesSection({ t }: { t: Dictionary["formed"] }) {
  return (
    <section id="lugares" aria-labelledby="lugares-titulo" className="relative isolate px-0 pb-4 pt-section-gap sm:px-6">
      <PaintReveal variant="rise" className="mx-auto max-w-[56rem]">
        <figure className="relative [container-type:inline-size]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/lugares-formaram/lugares-1400.webp"
            srcSet="/lugares-formaram/lugares-800.webp 800w, /lugares-formaram/lugares-1400.webp 1400w"
            sizes="(min-width: 56rem) 56rem, 100vw"
            width={1400}
            height={1400}
            alt={t.alt}
            loading="lazy"
            decoding="async"
            className="places-fade block h-auto w-full select-none"
          />

          <h2 id="lugares-titulo" className="absolute inset-x-0 top-[6.2%] text-center font-body uppercase leading-[1.1] tracking-[0.14em] text-text-title [font-size:max(1.35rem,5.4cqw)]">
            <span className="block">{t.title[0]}</span>
            <span className="block">{t.title[1]}</span>
          </h2>

          <p className={`${label} left-[74%] top-[21.5%]`}>
            <span className={name}>{t.cape[0]}</span>
            <span className={word}>{t.cape[1]}</span>
          </p>
          <p className={`${label} left-[20%] top-[47%]`}>
            <span className={name}>{t.angra[0]}</span>
            <span className={word}>{t.angra[1]}</span>
          </p>
          <p className={`${label} left-[75%] top-[72%]`}>
            <span className={name}>{t.brasilia[0]}</span>
            <span className={word}>{t.brasilia[1]}</span>
          </p>

          <figcaption className="absolute inset-x-0 top-[93.5%] text-center font-body tracking-[0.08em] text-text-primary [font-size:max(0.8rem,2.2cqw)]">
            {t.caption}
          </figcaption>
        </figure>
      </PaintReveal>
    </section>
  );
}
