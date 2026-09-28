import Link from "next/link";
import { Cloud } from "@/components/atoms/Cloud";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

/**
 * Organism `RsvpSection` (#confirmar) — chamada pra confirmar presença,
 * antes do Dress code: pergunta em caligrafia terracota, uma linha de apoio
 * e o botão pílula laranjinha (mesmo do "Salvar na agenda"). O botão leva
 * pra /confirmacao-de-presenca, que mostra o formulário da assessoria
 * dentro do nosso site (mesmo esquema da Lista de presentes).
 * `RsvpButton` é o mesmo botão, repetido no rodapé.
 */

export function rsvpHref(locale: Locale) {
  return locale === "pt" ? "/confirmacao-de-presenca" : `/confirmacao-de-presenca?lang=${locale}`;
}

export function RsvpButton({ t, locale, className = "" }: { t: Dictionary["rsvp"]; locale: Locale; className?: string }) {
  return (
    <Link
      href={rsvpHref(locale)}
      className={[
        "inline-flex min-h-[52px] items-center justify-center whitespace-nowrap rounded-pill bg-terracota-500 px-8 font-body text-100 font-bold uppercase tracking-[0.2em] text-white shadow-[0_10px_24px_-16px_rgba(152,75,44,0.9)] transition-colors hover:bg-terracota-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus",
        className,
      ].join(" ")}
    >
      {t.cta}
    </Link>
  );
}

export function RsvpSection({ t, locale }: { t: Dictionary["rsvp"]; locale: Locale }) {
  return (
    <section id="confirmar" aria-labelledby="confirmar-titulo" className="relative isolate px-6 py-section-gap">
      <Cloud id={4} className="right-[4%] top-6 w-[55vw] md:w-[24vw]" opacity={0.6} />
      <Cloud id={2} className="bottom-4 left-[3%] w-[50vw] md:w-[20vw]" opacity={0.5} />
      <SectionHeading id="confirmar-titulo" title={t.title} lead={t.lead} highlight />
      <PaintReveal variant="rise" delay={150} className="mt-9 flex justify-center">
        <RsvpButton t={t} locale={locale} />
      </PaintReveal>
    </section>
  );
}
