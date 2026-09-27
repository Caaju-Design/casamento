/**
 * Atom `Painting` — elementos em aquarela da Cidade do Cabo (a baía com a
 * Table Mountain, veleiros, árvores, ramos com florzinhas amarelas e
 * arbustos), os mesmos dos manuais dos padrinhos e dos pais. Foram
 * extraídos dos PDFs com a transparência original e ficam em
 * `public/decor/capetown/*.webp`.
 *
 * Os PDFs guardam essas artes em resolução baixa (~130 ppi), então cada uma
 * tem uma largura máxima sugerida (`w`, em px CSS) pra não ficar borrada.
 * As bordas de todas as artes foram "mastigadas" (fade com ruído, v2), então
 * nenhuma tem mais lado reto; `edge` só registra de que lado a arte original
 * era cortada. As seções não usam `overflow-hidden` — quem corta o excesso
 * lateral é o `overflow-x-clip` da página (HomePageTemplate).
 *
 * Só decoração: `aria-hidden`, sem clique. Quando `behind`, fica atrás do
 * conteúdo (`-z-10`; o pai precisa ser `isolate`).
 */

type PaintingInfo = { w: number; h: number; edge?: string };

export const PAINTINGS = {
  "baia-ilhas": { w: 753, h: 370 },
  "baia-veleiro": { w: 325, h: 305 },
  "faixa-mesa": { w: 753, h: 210 },
  "faixa-praia": { w: 753, h: 240 },
  "faixa-arbustos": { w: 753, h: 215 },
  "faixa-costa": { w: 661, h: 201 },
  arvore: { w: 211, h: 274, edge: "esquerda (tronco)" },
  "arvore-grande": { w: 254, h: 258, edge: "esquerda (tronco)" },
  "arvore-pequena": { w: 176, h: 154 },
  "ramo-canto-dir-baixo": { w: 255, h: 304, edge: "direita + baixo" },
  "ramo-canto-dir-baixo-2": { w: 154, h: 160, edge: "direita + baixo" },
  "ramo-canto-dir-cima": { w: 161, h: 217, edge: "direita + cima" },
  "ramo-borda-dir": { w: 175, h: 334, edge: "direita" },
  "ramo-borda-dir-2": { w: 104, h: 230, edge: "direita" },
  "ramo-borda-esq": { w: 126, h: 184, edge: "esquerda" },
  "ramo-pendente": { w: 229, h: 230, edge: "cima" },
  "ramo-canto": { w: 123, h: 206 },
  "ramo-solto": { w: 192, h: 236 },
  "ramo-solto-2": { w: 168, h: 205 },
  "arbustos-pedras": { w: 248, h: 165 },
  "arbustos-baixos": { w: 177, h: 75 },
  "arbusto-pedra-canto": { w: 304, h: 216, edge: "esquerda + baixo" },
  "arbusto-flor": { w: 111, h: 168 },
  folhagem: { w: 157, h: 118 },
} satisfies Record<string, PaintingInfo>;

export type PaintingName = keyof typeof PAINTINGS;

export interface PaintingProps {
  name: PaintingName;
  /** Posição e largura (ex.: "absolute right-0 bottom-0 w-[40vw] md:w-[16rem]"). */
  className?: string;
  /** Espelha na horizontal (pra usar um ramo de canto direito no canto esquerdo). */
  flip?: boolean;
  /** Atrás do conteúdo (-z-10). Padrão: sim. */
  behind?: boolean;
  /** Carrega logo (acima da dobra). */
  eager?: boolean;
}

export function Painting({ name, className, flip = false, behind = true, eager = false }: PaintingProps) {
  const p = PAINTINGS[name];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/decor/capetown/${name}.webp?v=2`}
      alt=""
      aria-hidden="true"
      width={p.w}
      height={p.h}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      className={[
        "pointer-events-none h-auto select-none",
        behind ? "-z-10" : "",
        flip ? "-scale-x-100" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
