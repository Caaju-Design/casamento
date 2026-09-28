/**
 * Trajetos de metrô/trem até a estação Alto da Boa Vista (Linha 5-Lilás), a
 * mais perto do casamento, pra seção "Chegando em São Paulo": saindo do
 * Aeroporto de Congonhas, do Aeroporto de Guarulhos e da Rodoviária do Tietê.
 * Conferido com os mapas de embarque das estações (fotos do Manu) e com as
 * notícias da Linha 17-Ouro (aberta em 2026) e da Linha 13-Jade.
 * Nomes de estação não se traduzem.
 */

export type LineId = "l1" | "l5" | "l13" | "l17";

/** Cores das linhas (um pouco mais suaves que as oficiais, pra conversar com a aquarela). */
export const LINE_COLORS: Record<LineId, string> = {
  l1: "#1f3f94", // Linha 1-Azul
  l5: "#7c62a8", // Linha 5-Lilás
  l13: "#1b8a74", // Linha 13-Jade (CPTM)
  l17: "#b58a24", // Linha 17-Ouro (monotrilho)
};

/** Um trecho numa linha: `stations` vai do embarque ao desembarque, inclusive. */
export interface Leg {
  line: LineId;
  toward: string;
  stations: string[];
}

export type ArrivalId = "congonhas" | "guarulhos" | "tiete";

export const ARRIVAL_IDS: ArrivalId[] = ["congonhas", "guarulhos", "tiete"];

export const ROUTES: Record<ArrivalId, { origin: "plane" | "bus"; legs: Leg[] }> = {
  congonhas: {
    origin: "plane",
    legs: [
      { line: "l17", toward: "Morumbi", stations: ["Aeroporto de Congonhas", "Brooklin Paulista", "Vereador José Diniz", "Campo Belo"] },
      { line: "l5", toward: "Capão Redondo", stations: ["Campo Belo", "Brooklin", "Borba Gato", "Alto da Boa Vista"] },
    ],
  },
  guarulhos: {
    origin: "plane",
    legs: [
      { line: "l13", toward: "Palmeiras-Barra Funda", stations: ["Aeroporto-Guarulhos", "Guarulhos-CECAP", "Brás", "Luz"] },
      {
        line: "l1",
        toward: "Jabaquara",
        stations: ["Luz", "São Bento", "Sé", "Liberdade", "São Joaquim", "Vergueiro", "Paraíso", "Ana Rosa", "Vila Mariana", "Santa Cruz"],
      },
      {
        line: "l5",
        toward: "Capão Redondo",
        stations: ["Santa Cruz", "Hospital São Paulo", "AACD-Servidor", "Moema", "Eucaliptos", "Campo Belo", "Brooklin", "Borba Gato", "Alto da Boa Vista"],
      },
    ],
  },
  tiete: {
    origin: "bus",
    legs: [
      {
        line: "l1",
        toward: "Jabaquara",
        stations: [
          "Portuguesa-Tietê",
          "Armênia",
          "Tiradentes",
          "Luz",
          "São Bento",
          "Sé",
          "Liberdade",
          "São Joaquim",
          "Vergueiro",
          "Paraíso",
          "Ana Rosa",
          "Vila Mariana",
          "Santa Cruz",
        ],
      },
      {
        line: "l5",
        toward: "Capão Redondo",
        stations: ["Santa Cruz", "Hospital São Paulo", "AACD-Servidor", "Moema", "Eucaliptos", "Campo Belo", "Brooklin", "Borba Gato", "Alto da Boa Vista"],
      },
    ],
  },
};
