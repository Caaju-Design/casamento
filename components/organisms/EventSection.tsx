import { Cloud } from "@/components/atoms/Cloud";
import { Painting } from "@/components/atoms/Painting";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { mapsSearch, wazeTo } from "@/lib/content/maps";

/**
 * Organism `EventSection` (#evento) — "O grande dia": data, local, como
 * chegar ao salão e o itinerário DOS CONVIDADOS (a chegada das 15h30 é só
 * de padrinhos e pais, fica nos manuais deles). Textos tirados dos manuais
 * do casal. Aquarelas da Cidade do Cabo compondo a tela.
 */

const ADDRESS = "Rua Luís Correia de Melo, 86 - Chácara Santo Antônio, São Paulo - SP, 04726-220";

const ITINERARY = [
  { time: "16h", title: "Chegada dos convidados", note: "Chegue com calma pra se acomodar antes da cerimônia." },
  { time: "16h30", title: "Cerimônia", note: "O momento do sim." },
  { time: "17h", title: "Recepção e celebração", note: "Boa comida, boas conversas, música e abraços." },
  { time: "22h", title: "Encerramento", note: "Fim da festa — e o começo de muitas lembranças." },
];

/** Evento de agenda: 17/04/2027, 16h–22h em São Paulo (UTC−3, sem horário de verão). */
const GOOGLE_CALENDAR =
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  `&text=${encodeURIComponent("Casamento Gabriela & Emanuel")}` +
  "&dates=20270417T190000Z/20270418T010000Z" +
  `&location=${encodeURIComponent(`Salão de Festas (Andar L), ${ADDRESS}`)}` +
  `&details=${encodeURIComponent("16h chegada · 16h30 cerimônia · 17h recepção · 22h encerramento\ncasamento.caaju.com.br")}`;

const linkClass =
  "inline-flex min-h-[44px] items-center justify-center rounded-pill border border-terracota-500 px-5 font-body text-100 uppercase tracking-[0.14em] text-terracota-700 transition-colors hover:bg-terracota-500 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus";

export function EventSection() {
  return (
    <section id="evento" aria-labelledby="evento-titulo" className="relative isolate overflow-hidden pb-[min(58vw,29rem)] pt-section-gap">
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
          eyebrow="O grande dia"
          title="Nosso encontro está marcado"
          lead="Sábado, 17 de abril de 2027"
        />

        <div className="mt-12 grid gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          {/* local */}
          <PaintReveal variant="rise" delay={150} className="text-center md:text-left">
            <h3 className="font-body text-100 uppercase tracking-[0.24em] text-salvia-800">Onde</h3>
            <p className="mt-3 font-display text-600 leading-tight text-text-primary">
              Ed. Square 2
              <br />
              Salão de Festas, Andar “L”
            </p>
            <p className="mt-2 font-body text-200 leading-relaxed text-text-secondary">
              Rua Luís Correia de Melo, 86
              <br />
              Chácara Santo Antônio · São Paulo · CEP 04726-220
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <a className={linkClass} href={mapsSearch(ADDRESS)} target="_blank" rel="noopener noreferrer">
                Google Maps
              </a>
              <a className={linkClass} href={wazeTo(ADDRESS)} target="_blank" rel="noopener noreferrer">
                Waze
              </a>
              <a className={linkClass} href={GOOGLE_CALENDAR} target="_blank" rel="noopener noreferrer">
                Salvar na agenda
              </a>
            </div>

            <div className="mt-8 space-y-5 text-left">
              <div>
                <h4 className="font-body text-100 uppercase tracking-[0.24em] text-salvia-800">Estacionamento</h4>
                <p className="mt-1 font-body text-200 leading-relaxed text-text-secondary">
                  O estacionamento é na rua e as vagas podem ser disputadas. Se puder, venha de carro de aplicativo.
                </p>
              </div>
              <div>
                <h4 className="font-body text-100 uppercase tracking-[0.24em] text-salvia-800">Acesso</h4>
                <p className="mt-1 font-body text-200 leading-relaxed text-text-secondary">
                  O casamento será em um condomínio. Enviaremos as orientações de entrada mais perto da data.
                </p>
              </div>
            </div>
          </PaintReveal>

          {/* itinerário */}
          <PaintReveal variant="rise" delay={300}>
            <h3 className="text-center font-body text-100 uppercase tracking-[0.24em] text-salvia-800 md:text-left">
              Itinerário
            </h3>
            <ol className="relative mt-5 border-l border-salvia-500/60 pl-8">
              {ITINERARY.map((step) => (
                <li key={step.time} className="relative pb-7 last:pb-0">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[2.4rem] top-1.5 block h-3.5 w-3.5 rounded-full border-2 border-page bg-salvia-500"
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
            Boa comida, boas conversas e pessoas queridas.
          </p>
          <p className="mt-3 font-body text-200 leading-relaxed text-text-secondary">
            Sonhamos com uma celebração pequena, acolhedora e com tempo para estar junto de verdade. Vai ter música,
            risadas, abraços e espaço para novos encontros.
          </p>
        </PaintReveal>
      </div>
    </section>
  );
}
