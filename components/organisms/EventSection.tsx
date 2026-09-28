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

/* Ícones de traço simples (herdam a cor do texto), no desenho dos botões. */
function IconParking() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4.5" />
      <path d="M9.5 17V7h3.6a3.1 3.1 0 0 1 0 6.2H9.5" />
    </svg>
  );
}

function IconAccess() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.8 4.5 5.6v5.6c0 4.6 3.1 8.5 7.5 10 4.4-1.5 7.5-5.4 7.5-10V5.6z" />
      <circle cx="12" cy="10.3" r="2.2" />
      <path d="M12 12.5v3.6" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.4v.1" />
    </svg>
  );
}

function Notice({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4 text-start">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-page text-terracota-700 shadow-[0_6px_16px_-10px_rgba(152,75,44,0.7)]">
        {icon}
      </span>
      <div>
        <h3 className="font-body text-100 font-bold uppercase tracking-[0.2em] text-terracota-700">{title}</h3>
        <p className="mt-1.5 font-body text-200 leading-relaxed text-text-primary">{text}</p>
      </div>
    </div>
  );
}

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
          highlight
        />

        {/* card "Reserve a data" (mesmo estilo do card de Presentes): data por
            extenso + botão à esquerda, folhinha com argolas à direita sobre
            pinceladas de aquarela */}
        <PaintReveal
          variant="rise"
          className="relative mt-12 grid items-center gap-4 rounded-[2rem] bg-salvia-50 shadow-[0_18px_50px_-30px_rgba(45,43,35,0.45)] md:grid-cols-[1.1fr_1fr]"
        >
          <div className="relative z-10 px-8 pb-2 pt-10 md:px-12 md:py-14">
            <h3 className="font-body text-400 uppercase tracking-[0.2em] text-text-primary sm:tracking-[0.28em]">{t.saveTitle}</h3>
            <span aria-hidden="true" className="mt-4 block h-px w-10 bg-salvia-700" />
            <p className="mt-5 font-body leading-snug text-text-primary" style={{ fontSize: "clamp(1.35rem, 2.2vw, 1.75rem)" }}>{t.lead}</p>
            <p className="mt-3 max-w-md font-body text-200 leading-relaxed text-text-secondary">{t.saveNote}</p>
            <a className={["mt-7", primaryClass].join(" ")} href={googleCalendar(t)} target="_blank" rel="noopener noreferrer">
              {t.calendar}
            </a>
          </div>

          <div className="relative isolate px-10 pb-14 pt-12 md:py-16 md:pe-14 md:ps-6">
            {/* pinceladas de aquarela atrás da folhinha */}
            {/* eslint-disable @next/next/no-img-element */}
            <img src="/decor/pinceladas/pessego.webp" alt="" aria-hidden="true" width={1000} height={260} className="pointer-events-none absolute -z-10 -start-[4%] top-[6%] w-[84%] -rotate-[9deg] select-none opacity-85 mix-blend-multiply md:-start-[8%]" />
            <img src="/decor/pinceladas/amarelo.webp" alt="" aria-hidden="true" width={1000} height={260} className="pointer-events-none absolute -z-10 end-[1%] top-[40%] w-[74%] rotate-[7deg] select-none opacity-80 mix-blend-multiply" />
            <img src="/decor/pinceladas/salvia.webp" alt="" aria-hidden="true" width={1000} height={260} className="pointer-events-none absolute -z-10 bottom-[2%] start-[6%] w-[80%] -rotate-[4deg] select-none opacity-75 mix-blend-multiply" />
            {/* eslint-enable @next/next/no-img-element */}
            <WeddingCalendar locale={locale} className="relative max-w-[20rem] sm:max-w-[21rem]" />
          </div>
        </PaintReveal>

        {/* ── Onde será ─────────────────────────────────────────────── */}
        <div className="mt-24">
          <SectionHeading id="evento-onde" title={t.whereTitle} highlight />

          <div className="mt-10 grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
            {/* fachada do condomínio, com bordas mastigadas */}
            <PaintReveal variant="paint" className="mx-auto w-full max-w-[22rem] md:max-w-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/evento/fachada.webp"
                alt={t.facadeAlt}
                width={509}
                height={768}
                loading="lazy"
                decoding="async"
                className="h-auto w-full"
              />
            </PaintReveal>

            <PaintReveal variant="rise" delay={150} className="text-center md:text-start">
              <p className="font-display leading-tight text-text-primary" style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)" }}>
                {t.venue[0]}
                <br />
                {t.venue[1]}
              </p>
              <p className="mt-3 font-body text-200 leading-relaxed text-text-secondary">
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
            </PaintReveal>
          </div>

          {/* avisos importantes: estacionamento e acesso */}
          <PaintReveal
            variant="rise"
            delay={200}
            className="relative mt-12 rounded-[1.75rem] border border-terracota-200 bg-pessego-50/80 px-6 pb-7 pt-9 md:px-10"
          >
            <span className="absolute -top-3.5 start-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-pill bg-terracota-500 px-4 py-1.5 font-body text-100 font-bold uppercase tracking-[0.2em] text-white rtl:translate-x-1/2">
              <IconAlert /> {t.importantLabel}
            </span>
            <div className="grid gap-7 md:grid-cols-2 md:gap-10">
              <Notice icon={<IconParking />} title={t.parkingTitle} text={t.parking} />
              <Notice icon={<IconAccess />} title={t.accessTitle} text={t.access} />
            </div>
          </PaintReveal>
        </div>

        {/* ── Itinerário ───────────────────────────────────────────── */}
        <div className="mt-24">
          <SectionHeading id="evento-itinerario" title={t.itineraryTitle} highlight />
          <PaintReveal variant="rise" delay={150} className="mx-auto mt-10 max-w-xl">
            <ol className="relative border-s border-salvia-500/60 ps-8">
              {t.itinerary.map((step) => (
                <li key={step.time} className="relative pb-8 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="absolute -start-[2.4rem] top-1.5 block h-3.5 w-3.5 rounded-full border-2 border-page bg-salvia-500"
                  />
                  <p className="font-body text-100 font-bold tracking-[0.12em] text-terracota-700">{step.time}</p>
                  <p className="mt-0.5 font-body font-bold leading-snug text-text-primary" style={{ fontSize: "clamp(1.3rem, 2.2vw, 1.6rem)" }}>
                    {step.title}
                  </p>
                  <p className="mt-1 font-body text-200 leading-relaxed text-text-secondary">{step.note}</p>
                </li>
              ))}
            </ol>
          </PaintReveal>
        </div>

        <PaintReveal variant="rise" delay={200} className="mx-auto mt-20 max-w-2xl text-center">
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
