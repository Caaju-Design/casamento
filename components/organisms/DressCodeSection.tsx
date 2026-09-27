import { Cloud } from "@/components/atoms/Cloud";
import { Painting } from "@/components/atoms/Painting";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { DressPalette } from "@/components/molecules/DressPalette";
import { SectionHeading } from "@/components/molecules/SectionHeading";

/**
 * Organism `DressCodeSection` (#dresscode) — traje dos CONVIDADOS (o dos
 * padrinhos e madrinhas fica só no manual deles). Proposta montada a
 * partir do "esporte fino" dos manuais e da paleta do casamento:
 *  - a paleta do dress code é a da identidade visual (7 famílias × 7 tons),
 *    em `DressPalette`: tocar numa cor abre os sobretons, do claro ao escuro;
 *  - pedido com carinho: branco/off-white ficam pra noiva.
 */

const AVOID = [{ name: "Branco e off-white", color: "#fbf8f2", why: "ficam para a noiva" }];

const MASK = {
  WebkitMaskImage: "url(/decor/capetown/mancha.webp)",
  maskImage: "url(/decor/capetown/mancha.webp)",
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
} as const;

function Swatch({ color, name, outline = false }: { color: string; name: string; outline?: boolean }) {
  return (
    <div className="flex w-20 flex-col items-center gap-2 text-center">
      <span
        aria-hidden="true"
        className={["block h-14 w-14", outline ? "drop-shadow-[0_0_1px_rgba(58,56,52,0.55)]" : ""].join(" ")}
        style={{ ...MASK, backgroundColor: color }}
      />
      <span className="font-body text-100 leading-tight text-text-secondary">{name}</span>
    </div>
  );
}

function Card({ title, children, delay }: { title: string; children: React.ReactNode; delay: number }) {
  return (
    <PaintReveal variant="rise" delay={delay} className="rounded-card border border-caramelo-100 bg-page/80 p-7 backdrop-blur-[2px] md:p-8">
      <h3 className="font-display text-600 leading-tight text-text-primary">{title}</h3>
      <div className="mt-4 space-y-3 font-body text-200 leading-relaxed text-text-secondary">{children}</div>
    </PaintReveal>
  );
}

export function DressCodeSection() {
  return (
    <section id="dresscode" aria-labelledby="dresscode-titulo" className="relative isolate overflow-hidden py-section-gap">
      <Painting name="ramo-pendente" flip className="absolute left-0 top-0 w-[38vw] max-w-[230px]" />
      <Painting name="arvore-grande" flip className="absolute bottom-[6%] right-0 hidden w-[15rem] md:block" />
      <Painting name="arbusto-pedra-canto" className="absolute bottom-0 left-0 w-[46vw] max-w-[300px]" />
      <Cloud id={3} className="right-0 top-0 w-[44vw] md:w-[22vw]" />
      <Cloud id={7} className="bottom-[30%] left-[4%] w-[60vw] md:w-[30vw]" opacity={0.7} />

      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading
          id="dresscode-titulo"
          eyebrow="Dress code"
          title="Esporte fino"
          lead="Queremos todo mundo lindo, confortável e com vontade de dançar. Pense em tecidos leves e elegantes, que combinem com um fim de tarde de outono em São Paulo."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card title="Para elas" delay={100}>
            <p>Vestidos midi ou longos, macacões e conjuntos de alfaiataria. Tecidos fluidos, como seda, crepe, linho e viscose, caem muito bem.</p>
            <p>No pé, vale o que deixar você dançar a noite toda: salto bloco, sandália ou sapatilha.</p>
          </Card>
          <Card title="Para eles" delay={250}>
            <p>Calça de alfaiataria ou de sarja com camisa social ou de linho. O blazer é bem-vindo e a gravata é opcional.</p>
            <p>Sapato social, loafer ou mocassim. A bermuda e o tênis ficam para outro dia.</p>
          </Card>
        </div>

        <PaintReveal variant="rise" delay={150} className="mt-14 text-center">
          <h3 className="font-body text-100 uppercase tracking-[0.24em] text-salvia-800">A paleta do nosso dia</h3>
          <p className="mx-auto mt-2 max-w-xl font-body text-200 leading-relaxed text-text-secondary">
            Tons suaves e terrosos, como numa aquarela. Escolha uma cor e brinque com os tons dela: do mais claro ao mais
            escuro, todos combinam com a gente.
          </p>
          <div className="mt-6">
            <DressPalette />
          </div>
        </PaintReveal>

        <PaintReveal variant="rise" delay={250} className="mx-auto mt-12 max-w-2xl rounded-card border border-caramelo-100 bg-page/80 p-7 text-center backdrop-blur-[2px]">
          <h3 className="font-body text-100 uppercase tracking-[0.24em] text-terracota-700">Pedimos com carinho</h3>
          <div className="mt-5 flex flex-wrap items-start justify-center gap-8">
            {AVOID.map((a) => (
              <div key={a.name} className="flex max-w-[12rem] flex-col items-center gap-2">
                <Swatch color={a.color} name={a.name} outline={a.color === "#fbf8f2"} />
                <span className="font-body text-100 italic text-text-secondary">{a.why}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 font-body text-200 leading-relaxed text-text-secondary">
            Em abril, as noites em São Paulo costumam ser mais fresquinhas: leve um casaquinho ou uma pashmina.
          </p>
        </PaintReveal>
      </div>
    </section>
  );
}
