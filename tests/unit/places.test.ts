import { describe, expect, it } from "vitest";
import { PLACES, VENUE, directionsUrl, distanceKm } from "@/lib/content/places";

describe("places", () => {
  it("distância em linha reta (haversine)", () => {
    // 0,01° de latitude ≈ 1,11 km
    expect(distanceKm({ lat: -23.63, lng: -46.7 }, { lat: -23.64, lng: -46.7 })).toBeCloseTo(1.112, 2);
    expect(distanceKm(VENUE, VENUE)).toBe(0);
  });

  it("todos os lugares ficam num raio de 5 km do salão", () => {
    for (const p of PLACES) expect(distanceKm(VENUE, p)).toBeLessThan(5);
  });

  it("ids únicos e rota saindo do salão", () => {
    expect(new Set(PLACES.map((p) => p.id)).size).toBe(PLACES.length);
    expect(directionsUrl("MorumbiShopping")).toContain("origin=Rua%20Lu%C3%ADs%20Correia%20de%20Melo");
  });
});
