/**
 * Atom `Cloud` — nuvem em aquarela (pêssego) espalhada pelo site como
 * ornamento. As imagens vêm do pattern enviado pelo casal, recortado em 9
 * nuvens soltas (`public/decor/nuvens/n1…n9.webp`, fundo transparente).
 *
 * Algumas nuvens têm um lado RETO de propósito — foram desenhadas pra
 * encostar na borda da tela (ver `edge`). Nessas, posicione com `left-0`,
 * `right-0` ou `top-0` do lado reto; as "soltas" podem ficar em qualquer lugar.
 *
 * É só decoração: `aria-hidden`, sem clique, e fica ATRÁS do conteúdo
 * (`-z-10`) — o pai precisa ser um contexto de empilhamento (`isolate`,
 * ou `sticky`, que já cria um). `mix-blend-multiply` faz a tinta "entrar"
 * no papel, como aquarela de verdade.
 */

type CloudInfo = { w: number; h: number; /** lado(s) reto(s) da nuvem */ edge: string };

export const CLOUDS = {
  1: { w: 361, h: 428, edge: "direita" },
  2: { w: 551, h: 354, edge: "esquerda + topo" },
  3: { w: 390, h: 295, edge: "direita + topo" },
  4: { w: 808, h: 434, edge: "esquerda" },
  5: { w: 536, h: 116, edge: "solta (fiapo)" },
  6: { w: 494, h: 271, edge: "direita" },
  7: { w: 900, h: 137, edge: "solta (fiapo longo)" },
  8: { w: 865, h: 297, edge: "solta" },
  9: { w: 323, h: 262, edge: "esquerda" },
} satisfies Record<number, CloudInfo>;

export type CloudId = keyof typeof CLOUDS;

export interface CloudProps {
  id: CloudId;
  /** Posição e largura (classes absolutas, ex.: "right-0 top-[10%] w-[40vw] md:w-[22vw]"). */
  className: string;
  /** Opacidade da tinta (padrão 0,95). */
  opacity?: number;
}

export function Cloud({ id, className, opacity = 0.95 }: CloudProps) {
  const c = CLOUDS[id];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/decor/nuvens/n${id}.webp`}
      alt=""
      aria-hidden="true"
      width={c.w}
      height={c.h}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={["pointer-events-none absolute -z-10 h-auto select-none mix-blend-multiply", className].join(" ")}
      style={{ opacity }}
    />
  );
}
