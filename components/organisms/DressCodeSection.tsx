import { Cloud } from "@/components/atoms/Cloud";
import { Painting } from "@/components/atoms/Painting";
import { PaintReveal } from "@/components/molecules/PaintReveal";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Organism `DressCodeSection` (#dresscode) — traje dos CONVIDADOS (o dos
 * padrinhos e madrinhas fica só no manual deles). Proposta montada a
 * partir do "esporte fino" dos manuais e da paleta do casamento:
 *  - só os cards Para elas / Para eles. A paleta interativa (`DressPalette`)
 *    e o bloco "Pedimos com carinho" (branco/off-white + dica de clima)
 *    saíram a pedido do Manu; o componente e os textos continuam no projeto
 *    caso voltem.
 */


function Card({ title, children, delay, art, artAlt }: { title: string; children: React.ReactNode; delay: number; art: string; artAlt: string }) {
  return (
    <PaintReveal variant="rise" delay={delay} className="rounded-card border border-caramelo-100 bg-page/80 p-7 backdrop-blur-[2px] md:p-8">
      {/* ilustração em aquarela dos calçados, em perspectiva (public/dresscode) */}
      <div className="-mt-2 mb-5 flex h-32 items-end justify-center sm:h-36">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={art} alt={artAlt} width={600} height={300} loading="lazy" decoding="async" className="h-full w-auto max-w-full object-contain mix-blend-multiply" />
      </div>
      <h3 className="font-body font-bold leading-tight text-text-primary" style={{ fontSize: "clamp(1.35rem, 2.2vw, 1.65rem)" }}>
        {title}
      </h3>
      <div className="mt-3 space-y-3 font-body text-200 leading-relaxed text-text-secondary">{children}</div>
    </PaintReveal>
  );
}

export function DressCodeSection({ t }: { t: Dictionary["dress"] }) {
  return (
    <section id="dresscode" aria-labelledby="dresscode-titulo" className="relative isolate py-section-gap">
      <Painting name="ramo-pendente" flip className="absolute left-0 top-0 w-[38vw] max-w-[230px]" />
      <Painting name="arvore-grande" flip className="absolute bottom-[6%] right-0 hidden w-[15rem] md:block" />
      <Painting name="arbusto-pedra-canto" className="absolute bottom-0 left-0 w-[46vw] max-w-[300px]" />
      <Cloud id={3} className="right-0 top-0 w-[44vw] md:w-[22vw]" />
      <Cloud id={7} className="bottom-[30%] left-[4%] w-[60vw] md:w-[30vw]" opacity={0.7} />

      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading
          id="dresscode-titulo"
          eyebrow={t.eyebrow}
          title={t.title}
          lead={t.lead}
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Card title={t.herTitle} delay={100} art="/dresscode/elas.webp" artAlt={t.herArt}>
            <p>{t.her[0]}</p>
            <p>{t.her[1]}</p>
          </Card>
          <Card title={t.himTitle} delay={250} art="/dresscode/eles.webp" artAlt={t.himArt}>
            <p>{t.him[0]}</p>
            <p>{t.him[1]}</p>
          </Card>
        </div>
      </div>
    </section>
  );
}
