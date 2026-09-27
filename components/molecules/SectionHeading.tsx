import { PaintReveal } from "@/components/molecules/PaintReveal";

export interface SectionHeadingProps {
  /** Rótulo pequeno em caixa alta (Cardo), acima do título. */
  eyebrow: string;
  /** Título em caligrafia (Italianno). */
  title: string;
  /** id do título, pra `aria-labelledby` da seção. */
  id: string;
  /** Linha de apoio logo abaixo do título. */
  lead?: string;
  align?: "center" | "left";
  /** Título na cor de destaque (`text-title`, #bc6316) em vez do texto principal. */
  highlight?: boolean;
}

/** Molecule `SectionHeading` — cabeçalho das seções informativas da home. */
export function SectionHeading({ eyebrow, title, id, lead, align = "center", highlight = false }: SectionHeadingProps) {
  const center = align === "center";
  return (
    <PaintReveal variant="rise" className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="font-body text-100 uppercase tracking-[0.3em] text-terracota-700">{eyebrow}</p>
      <h2
        id={id}
        className={["mt-3 font-display leading-tight", highlight ? "text-text-title" : "text-text-primary"].join(" ")}
        style={{ fontSize: "clamp(2.2rem, 5.5vw, 3.6rem)" }}
      >
        {title}
      </h2>
      {lead && <p className="mt-4 font-body text-200 leading-relaxed text-text-secondary">{lead}</p>}
    </PaintReveal>
  );
}
