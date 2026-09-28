/**
 * Lugares do entorno do casamento, pro mapa da seção "Onde ficar e
 * aproveitar" (#hospedagem). Os nomes não se traduzem; as descrições vêm do
 * dicionário (`t.around.desc[id]`).
 *
 * ⚠️ COORDENADAS APROXIMADAS: foram estimadas sem acesso a um geocodificador
 * (a rede da sessão bloqueava). Os lugares marcados `approx: true` precisam
 * ser conferidos: abrir o lugar no Google Maps, clicar com o botão direito no
 * pin e copiar "lat, lng" pra cá. O endereço do salão também.
 */

export type PlaceCategory = "hotel" | "cafe" | "restaurante" | "shopping" | "beleza";

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  /** Busca no Google Maps (rota a partir do salão). */
  query: string;
  approx?: boolean;
  /** Foto do lugar (quadrada) em public/lugares/<id>.webp. Sem ela, o card mostra uma aquarela da categoria. */
  photo?: string;
}

/** Salão de festas do casamento — Rua Luís Correia de Melo, 86. */
export const VENUE = {
  name: "Ed. Square 2 · Salão de Festas",
  lat: -23.6335,
  lng: -46.7055,
  query: "Rua Luís Correia de Melo, 86 - Chácara Santo Antônio, São Paulo - SP, 04726-220",
  approx: true,
};

export const PLACES: Place[] = [
  // hotéis
  { id: "intercity", name: "Intercity Nações Unidas", category: "hotel", lat: -23.6392, lng: -46.7106, query: "Intercity Nações Unidas, São Paulo", approx: true },
  { id: "transamerica", name: "Transamerica Executive Chácara Santo Antônio", category: "hotel", lat: -23.6329, lng: -46.7022, query: "Transamerica Executive Chácara Santo Antônio, São Paulo", approx: true },
  { id: "novotel", name: "Novotel São Paulo Berrini", category: "hotel", lat: -23.6069, lng: -46.6938, query: "Novotel São Paulo Berrini", approx: true },
  { id: "ibis", name: "ibis budget São Paulo Morumbi", category: "hotel", lat: -23.6219, lng: -46.6975, query: "ibis budget São Paulo Morumbi", approx: true },
  // cafés e padarias
  { id: "flor", name: "Padaria Flor das Américas", category: "cafe", lat: -23.6292, lng: -46.7043, query: "Padaria Flor das Américas, São Paulo", approx: true },
  { id: "giga", name: "Giga", category: "cafe", lat: -23.6318, lng: -46.7031, query: "Giga, Chácara Santo Antônio, São Paulo", approx: true },
  // restaurantes e botecos
  { id: "casarao", name: "Casarão de Minas", category: "restaurante", lat: -23.6347, lng: -46.7071, query: "Casarão de Minas, São Paulo", approx: true },
  { id: "parrilaria", name: "Parrilaria Granja Julieta", category: "restaurante", lat: -23.6372, lng: -46.7083, query: "Parrilaria Granja Julieta, São Paulo", approx: true },
  { id: "boteco-vc", name: "Boteco Vila Cruzeiro", category: "restaurante", lat: -23.6398, lng: -46.7147, query: "Boteco Vila Cruzeiro, São Paulo", approx: true },
  { id: "boteco-sp", name: "Boteco São Paulo — Vila Cruzeiro", category: "restaurante", lat: -23.6412, lng: -46.7128, query: "Boteco São Paulo, Vila Cruzeiro, São Paulo", approx: true },
  // shoppings
  { id: "parque-cidade", name: "Shopping Parque da Cidade", category: "shopping", lat: -23.6262, lng: -46.7011, query: "Shopping Parque da Cidade, São Paulo", approx: true },
  { id: "morumbi", name: "MorumbiShopping", category: "shopping", lat: -23.6231, lng: -46.6989, query: "MorumbiShopping, São Paulo", approx: true },
  { id: "market-place", name: "Shopping Market Place", category: "shopping", lat: -23.6177, lng: -46.6969, query: "Shopping Market Place, São Paulo", approx: true },
  // salões e barbearias
  { id: "ritualle", name: "Ritualle Bem Estar", category: "beleza", lat: -23.6405, lng: -46.7162, query: "Ritualle Bem Estar, Vila Cruzeiro, São Paulo", approx: true },
  { id: "geff", name: "Geff Lima", category: "beleza", lat: -23.6361, lng: -46.7092, query: "Geff Lima, Rua Booker Pittman, 57, São Paulo", approx: true },
  { id: "jacques", name: "Jacques Janine", category: "beleza", lat: -23.6356, lng: -46.7058, query: "Jacques Janine Granja Julieta, São Paulo", approx: true },
  { id: "dharma", name: "Espaço Dharma", category: "beleza", lat: -23.6389, lng: -46.7171, query: "Espaço Dharma, Vila Cruzeiro, São Paulo", approx: true },
  { id: "tarantino", name: "Tarantino", category: "beleza", lat: -23.6309, lng: -46.7049, query: "Barbearia Tarantino, Chácara Santo Antônio, São Paulo", approx: true },
  { id: "corleone", name: "Corleone", category: "beleza", lat: -23.6228, lng: -46.6994, query: "Barbearia Corleone, MorumbiShopping, São Paulo", approx: true },
];

/** Distância em linha reta (km), fórmula de haversine. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Rota no Google Maps saindo do salão até o lugar. */
export function directionsUrl(to: string): string {
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(VENUE.query)}&destination=${encodeURIComponent(to)}`;
}
