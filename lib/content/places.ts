/**
 * Lugares do entorno do casamento, pro mapa da seção "Onde ficar e
 * aproveitar" (#hospedagem). Os nomes não se traduzem; as descrições vêm do
 * dicionário (`t.around.desc[id]`).
 *
 * Coordenadas conferidas no Google Maps (set/2026), lugar por lugar. Se
 * algum mudar de endereço: abrir no Google Maps, clicar com o botão direito
 * no pin e copiar "lat, lng" pra cá.
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
  lat: -23.634003,
  lng: -46.713821,
  query: "Rua Luís Correia de Melo, 86 - Santo Amaro, São Paulo - SP, 04726-220",
};

export const PLACES: Place[] = [
  // hotéis
  { id: "intercity", name: "Hotel Intercity Nações Unidas", category: "hotel", lat: -23.6294, lng: -46.707302, query: "Hotel Intercity Nações Unidas, São Paulo", photo: "/lugares/intercity.webp" },
  { id: "transamerica", name: "Transamerica Executive Chácara Santo Antônio", category: "hotel", lat: -23.628854, lng: -46.706791, query: "Transamerica Executive Chácara Santo Antônio, São Paulo", photo: "/lugares/transamerica.webp" },
  { id: "novotel", name: "Novotel São Paulo Berrini", category: "hotel", lat: -23.62759, lng: -46.69881, query: "Novotel São Paulo Berrini", photo: "/lugares/novotel.webp" },
  { id: "ibis", name: "ibis budget São Paulo Morumbi", category: "hotel", lat: -23.621733, lng: -46.696065, query: "ibis budget São Paulo Morumbi", photo: "/lugares/ibis.webp" },
  // cafés e padarias
  { id: "flor", name: "Padaria Flor das Américas", category: "cafe", lat: -23.637897, lng: -46.711934, query: "Panificadora Flor das Américas, Vila Cruzeiro, São Paulo", photo: "/lugares/flor.webp" },
  { id: "giga", name: "Giga Atacado", category: "cafe", lat: -23.634198, lng: -46.71733, query: "Giga Atacado Nações Unidas, São Paulo", photo: "/lugares/giga.webp" },
  // restaurantes e botecos
  { id: "casarao", name: "Casarão de Minas", category: "restaurante", lat: -23.634195, lng: -46.712846, query: "Casarão de Minas, São Paulo", photo: "/lugares/casarao.webp" },
  { id: "parrilaria", name: "Dumas Parrillaria", category: "restaurante", lat: -23.630789, lng: -46.706196, query: "Dumas Parrillaria, Chácara Santo Antônio, São Paulo", photo: "/lugares/parrilaria.webp" },
  { id: "bella-julieta", name: "Parrillaria Bella Julieta", category: "restaurante", lat: -23.631034, lng: -46.712216, query: "Parrillaria Bella Julieta, São Paulo", photo: "/lugares/bella-julieta.webp" },
  { id: "boteco-vc", name: "Boteco Vila Cruzeiro", category: "restaurante", lat: -23.635214, lng: -46.711534, query: "Boteco Vila Cruzeiro, São Paulo", photo: "/lugares/boteco-vc.webp" },
  { id: "boteco-sp", name: "Boteco São Paulo — Vila Cruzeiro", category: "restaurante", lat: -23.636661, lng: -46.711534, query: "Boteco São Paulo, Vila Cruzeiro, São Paulo", photo: "/lugares/boteco-sp.webp" },
  // shoppings
  { id: "parque-cidade", name: "Shopping Parque da Cidade", category: "shopping", lat: -23.625357, lng: -46.706049, query: "Shopping Parque da Cidade, São Paulo", photo: "/lugares/parque-cidade.webp" },
  { id: "morumbi", name: "MorumbiShopping", category: "shopping", lat: -23.623362, lng: -46.698835, query: "MorumbiShopping, São Paulo", photo: "/lugares/morumbi.webp" },
  { id: "market-place", name: "Shopping Market Place", category: "shopping", lat: -23.62153, lng: -46.700566, query: "Shopping Market Place, São Paulo", photo: "/lugares/market-place.webp" },
  // salões e barbearias
  { id: "ritualle", name: "Ritualle", category: "beleza", lat: -23.636344, lng: -46.713217, query: "Ritualle, Vila Cruzeiro, São Paulo", photo: "/lugares/ritualle.webp" },
  { id: "geff", name: "Gerferson Lima", category: "beleza", lat: -23.632058, lng: -46.70873, query: "Gerferson Lima Salão, Esmalteria e Estética, São Paulo", photo: "/lugares/geff.webp" },
  { id: "jacques", name: "Jacques Janine", category: "beleza", lat: -23.640002, lng: -46.698333, query: "Jacques Janine Granja Julieta, São Paulo", photo: "/lugares/jacques.webp" },
  { id: "dharma", name: "Espaço Dharma", category: "beleza", lat: -23.640162, lng: -46.710641, query: "Espaço Dharma Salão de Beleza, Vila Cruzeiro, São Paulo", photo: "/lugares/dharma.webp" },
  { id: "tarantino", name: "Tarantino", category: "beleza", lat: -23.630832, lng: -46.703228, query: "Barbearia Tarantino, Chácara Santo Antônio, São Paulo", photo: "/lugares/tarantino.webp" },
  { id: "corleone", name: "Corleone", category: "beleza", lat: -23.623117, lng: -46.698607, query: "Barbearia Corleone, MorumbiShopping, São Paulo", photo: "/lugares/corleone.webp" },
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
