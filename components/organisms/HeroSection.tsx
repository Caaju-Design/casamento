"use client";

import dynamic from "next/dynamic";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";

// A cena three.js (e o próprio @react-three/fiber) só existe no navegador —
// carregada com `ssr: false` para nunca ser executada durante o
// pré-renderização no servidor (puramente decorativa, sem papel funcional).
const HeroScene = dynamic(() => import("@/components/three/HeroScene").then((mod) => mod.HeroScene), {
  ssr: false,
});

/** Organism `HeroSection` (com cena three.js) — topo da home. */
export function HeroSection() {
  return (
    <section id="topo" className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
      <HeroScene />
      <div className="relative z-10 flex max-w-2xl flex-col items-center gap-field-gap">
        <Text tone="secondary" className="uppercase tracking-[0.3em] text-100">
          Vamos nos casar
        </Text>
        <Heading as="h1" size="xl">
          Emanuel &amp; Gabriela
        </Heading>
        <Text tone="secondary" className="text-400">
          17 de abril de 2027
        </Text>
        <Text className="max-w-lg">
          Com o coração cheio de alegria, convidamos você para celebrar ao nosso lado o começo de uma nova
          história. Sua presença é o presente que mais desejamos.
        </Text>
        <nav className="mt-4 flex flex-wrap justify-center gap-4 font-body text-100">
          <a href="#historia" className="rounded-pill border border-border-subtle px-5 py-2 hover:bg-blush-50">
            Nossa história
          </a>
          <a href="#evento" className="rounded-pill border border-border-subtle px-5 py-2 hover:bg-blush-50">
            O evento
          </a>
          <a href="#recomendacoes" className="rounded-pill border border-border-subtle px-5 py-2 hover:bg-blush-50">
            Hospedagem e restaurantes
          </a>
        </nav>
      </div>
    </section>
  );
}
