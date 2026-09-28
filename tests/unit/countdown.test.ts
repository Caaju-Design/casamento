import { describe, expect, it } from "vitest";
import { daysLeft } from "@/components/molecules/Countdown";

describe("daysLeft (fuso de São Paulo)", () => {
  it("conta os dias até 17/04/2027", () => {
    expect(daysLeft(new Date("2027-04-10T15:00:00Z"))).toBe(7);
    expect(daysLeft(new Date("2027-04-16T15:00:00Z"))).toBe(1);
  });

  it("é 0 (é hoje) durante todo o dia 17 em São Paulo", () => {
    expect(daysLeft(new Date("2027-04-17T03:00:00Z"))).toBe(0); // 00:00 em SP
    expect(daysLeft(new Date("2027-04-18T02:30:00Z"))).toBe(0); // 23:30 em SP
  });

  it("usa o dia de São Paulo, não o UTC", () => {
    // 01:00 UTC do dia 17 ainda é 22:00 do dia 16 em SP
    expect(daysLeft(new Date("2027-04-17T01:00:00Z"))).toBe(1);
  });

  it("fica negativo depois do casamento", () => {
    expect(daysLeft(new Date("2027-04-19T15:00:00Z"))).toBeLessThan(0);
  });
});
