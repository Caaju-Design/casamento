import { Cloud } from "@/components/atoms/Cloud";
import { Painting } from "@/components/atoms/Painting";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { WeddingCalendar } from "@/components/molecules/WeddingCalendar";
import { mapsSearch, wazeTo } from "@/lib/content/maps";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";

/**
 * Organism `EventSection` (#evento) — "O grande dia": data, local, como
 * chegar ao salão e o itinerário DOS CONVIDADOS (a chegada das 15h30 é só
 * de padrinhos e pais, fica nos manuais deles). Textos tirados dos manuais
 * do casal. Aquarelas da Cidade do Cabo compondo a tela.
 */

const ADDRESS = "Rua Luís Correia de Melo, 86 - Chácara Santo Antônio, São Paulo - SP, 04726-220";

/** Evento de agenda: 17/04/2027, 16h–22h em São Paulo (UTC−3, sem horário de verão). */
function googleCalendar(t: Dictionary["event"]) {
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    `&text=${encodeURIComponent(t.calendarTitle)}` +
    "&dates=20270417T190000Z/20270418T010000Z" +
    `&location=${encodeURIComponent(`Salão de Festas (Andar L), ${ADDRESS}`)}` +
    `&details=${encodeURIComponent(`${t.calendarDetails}\ncasamento.caaju.com.br`)}`
  );
}

const linkClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-pill border border-terracota-500 px-5 font-body text-100 uppercase tracking-[0.14em] text-terracota-700 transition-colors hover:bg-terracota-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus";

const primaryClass =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-pill bg-terracota-500 px-7 font-body text-100 uppercase tracking-[0.16em] text-white shadow-[0_10px_24px_-16px_rgba(152,75,44,0.9)] transition-colors hover:bg-terracota-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus";

export function EventSection({ t, locale }: { t: Dictionary["event"]; locale: Locale }) {
  return (
    <section id="evento" aria-labelledby="evento-titulo" className="relative isolate pb-[min(58vw,29rem)] pt-section-gap">
      {/* aquarelas: ramo no canto de cima, árvore à esquerda, a baía embaixo */}
      <Painting name="ramo-canto-dir-cima" className="absolute right-0 top-0 w-[30vw] max-w-[190px]" />
      <Painting name="ramo-borda-esq" className="absolute left-0 top-[18%] hidden w-[9rem] md:block" />
      <Cloud id={5} className="left-[8%] top-10 w-[46vw] md:w-[24vw]" opacity={0.8} />
      <Painting name="baia-ilhas" className="absolute bottom-0 left-1/2 w-[min(100%,820px)] -translate-x-1/2" />
      <Painting name="arvore" className="absolute bottom-0 left-0 w-[28vw] max-w-[230px]" />
      <Painting name="ramo-canto-dir-baixo" className="absolute bottom-0 right-0 w-[34vw] max-w-[240px]" />

      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading
          id="evento-titulo"
          eyebrow={t.eyebrow}
          title={t.title}
          lead={t.lead}
          highlight
        />

        {/* folhinha de abril com o 17 circulado no pincel + salvar na agenda */}
        <WeddingCalendar locale={locale} className="mt-10" />
        <PaintReveal variant="rise" delay={250} className="mt-6 flex justify-center">
          <a className={primaryClass} href={googleCalendar(t)} target="_blank" rel="noopener noreferrer">
            {t.calendar}
          </a>
        </PaintReveal>

        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          {/* local */}
          <PaintReveal variant="rise" delay={150} className="text-center md:text-start">
            <h3 className="font-body text-100 uppercase tracking-[0.24em] text-salvia-800">{t.where}</h3>
            <p className="mt-3 font-display text-600 leading-tight text-text-primary">
              {t.venue[0]}
              <br />
              {t.venue[1]}
            </p>
            <p className="mt-2 font-body text-200 leading-relaxed text-text-secondary">
              {t.address[0]}
              <br />
              {t.address[1]}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <a className={linkClass} href={mapsSearch(ADDRESS)} target="_blank" rel="noopener noreferrer">
                {t.maps}
              </a>
              <a className={linkClass} href={wazeTo(ADDRESS)} target="_blank" rel="noopener noreferrer">
                {t.waze}
              </a>
            </div>

            <div className="mt-8 space-y-5 text-start">
              <div>
                <h4 className="font-body text-100 uppercase tracking-[0.24em] text-salvia-800">{t.parkingTitle}</h4>
                <p className="mt-1 font-body text-200 leading-relaxed text-text-secondary">
                  {t.parking}
                </p>
              </div>
              <div>
                <h4 className="font-body text-100 uppercase tracking-[0.24em] text-salvia-800">{t.accessTitle}</h4>
                <p className="mt-1 font-body text-200 leading-relaxed text-text-secondary">
                  {t.access}
                </p>
              </div>
            </div>
          </PaintReveal>

          {/* itinerário */}
          <PaintReveal variant="rise" delay={300}>
            <h3 className="text-center font-body text-100 uppercase tracking-[0.24em] text-salvia-800 md:text-start">
              {t.itineraryTitle}
            </h3>
            <ol className="relative mt-5 border-s border-salvia-500/60 ps-8">
              {t.itinerary.map((step) => (
                <li key={step.time} className="relative pb-7 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="absolute -start-[2.4rem] top-1.5 block h-3.5 w-3.5 rounded-full border-2 border-page bg-salvia-500"
                  />
                  <p className="font-body text-100 font-bold tracking-[0.12em] text-terracota-700">{step.time}</p>
                  <p className="font-display text-600 leading-tight text-text-primary">{step.title}</p>
                  <p className="mt-1 font-body text-100 leading-relaxed text-text-secondary">{step.note}</p>
                </li>
              ))}
            </ol>
          </PaintReveal>
        </div>

        <PaintReveal variant="rise" delay={200} className="mx-auto mt-16 max-w-2xl text-center">
          <p className="font-display leading-snug text-text-primary" style={{ fontSize: "clamp(1.7rem, 3.2vw, 2.4rem)" }}>
            {t.quoteTitle}
          </p>
          <p className="mt-3 font-body text-200 leading-relaxed text-text-secondary">
            {t.quote}
          </p>
        </PaintReveal>
      </div>
    </section>
  );
}
