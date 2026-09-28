/**
 * Trajeto de metrô da Rodoviária do Tietê até a estação Alto da Boa Vista
 * (a mais perto do casamento), pro mapa da seção "Chegando em São Paulo".
 * Conferido com os mapas de embarque das estações (fotos do Manu).
 * Nomes de estação não se traduzem.
 */

export const METRO_LINES = {
  /** Linha 1-Azul, Metrô. */
  l1: { color: "#1f3f94", toward: "Jabaquara" },
  /** Linha 5-Lilás, ViaMobilidade. */
  l5: { color: "#7c62a8", toward: "Capão Redondo" },
} as const;

/** Embarque. */
export const METRO_START = "Portuguesa-Tietê";
/** Linha 1, entre o Tietê e a baldeação (sem as pontas). */
export const METRO_L1_STOPS = ["Armênia", "Tiradentes", "Luz", "São Bento", "Sé", "Liberdade", "São Joaquim", "Vergueiro", "Paraíso", "Ana Rosa", "Vila Mariana"];
/** Baldeação Linha 1 → Linha 5. */
export const METRO_TRANSFER = "Santa Cruz";
/** Linha 5, entre a baldeação e o desembarque (sem as pontas). */
export const METRO_L5_STOPS = ["Hospital São Paulo", "AACD-Servidor", "Moema", "Eucaliptos", "Campo Belo", "Brooklin", "Borba Gato"];
/** Desembarque. */
export const METRO_END = "Alto da Boa Vista";
