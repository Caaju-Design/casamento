"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, type CSSProperties, type RefObject } from "react";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";

// A cena three.js (e o próprio @react-three/fiber) só existe no navegador —
// carregada com `ssr: false` para nunca ser executada durante o
// pré-renderização no servidor (puramente decorativa, sem papel funcional).
const HeroScene = dynamic(() => import("@/components/three/HeroScene").then((mod) => mod.HeroScene), {
  ssr: false,
});

/**
 * Altura do "trilho" de rolagem do hero, em múltiplos da viewport. O vídeo
 * fica pinado (`position: sticky`) enquanto o usuário rola por essa
 * distância — 1 unidade a mais de altura vira 1 viewport a mais de rolagem
 * disponível pra "puxar" o `currentTime` do vídeo do início ao fim.
 *
 * Efeito puramente decorativo — mesma exceção de `prefers-reduced-motion`
 * já documentada em components/three/HeroScene.tsx e
 * docs/design-system/acessibilidade.md (decisão de produto do casal, não do
 * agente).
 */
const SCROLL_TRACK_VH = 300;

/**
 * Fração do progresso de rolagem (0 a 1) em que a caligrafia de entrada
 * termina de sumir e o bloco de conteúdo padrão termina de aparecer — os
 * dois lêem a mesma `--hero-progress` setada por `useScrollScrubVideo` e
 * fazem o crossfade em CSS puro (`clamp()`), sem re-render do React a cada
 * frame de scroll.
 */
const CALLIGRAPHY_FADE_END = 0.12;

/**
 * Segundo do vídeo (não fração de progresso — segundo de verdade, porque é
 * assim que o casal pensa nisso: "a partir do 8º segundo") a partir do qual
 * o hero inteiro (vídeo, cena three.js, texto) começa a dissolver em
 * direção ao resto do site, terminando exatamente no último frame do
 * vídeo. Calculado contra `video.duration` em tempo real, então continua
 * correto se um dia o vídeo do hero for trocado por um de outra duração.
 */
const VIDEO_FADE_START_SECONDS = 8;

/**
 * Amarra o `currentTime` de um `<video>` à posição de rolagem de um
 * elemento "trilho" mais alto que ele (`trackRef`), sem nunca chamar
 * `.play()` — o vídeo só avança via seek manual, então no primeiro
 * carregamento (progress = 0) ele fica parado no primeiro frame até o
 * usuário começar a rolar.
 *
 * Retorna o próprio progresso (0 a 1) através de uma CSS custom property
 * (`--hero-progress`) no elemento do trilho, pra outros elementos (overlay
 * caligráfico, fade final) lerem sem re-render do React a cada frame de
 * scroll.
 */
function useScrollScrubVideo(
  trackRef: RefObject<HTMLDivElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  progressRef: RefObject<number>,
) {
  useEffect(() => {
    const video = videoRef.current;
    const track = trackRef.current;
    if (!video || !track) return;

    let duration = 0;
    let rafId: number | null = null;

    const updateScrub = () => {
      rafId = null;
      const rect = track.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      const progress = scrollableDistance > 0 ? Math.min(1, Math.max(0, -rect.top / scrollableDistance)) : 0;

      track.style.setProperty("--hero-progress", progress.toString());
      // Mesmo valor, mas como número puro numa ref — a cena three.js
      // (HeroScene) lê isso a cada frame do próprio loop de render dela,
      // sem precisar reler CSS nem re-renderizar o React.
      progressRef.current = progress;

      if (duration > 0) {
        const targetTime = progress * duration;
        // Só re-seeka se a diferença for perceptível — evita brigar com o
        // decoder do vídeo a cada pixel de scroll.
        if (Math.abs(video.currentTime - targetTime) > 0.033) {
          video.currentTime = targetTime;
        }

        // Dissolve final: 1 do início do 8º segundo até 0 no último frame.
        // Antes do 8º segundo o hero fica 100% opaco — só nesse trecho
        // final é que ele começa a sumir, revelando o resto do site por
        // trás (a section é `position: sticky`; ao terminar de dissolver,
        // o scroll já passou do trilho dela e a próxima seção sobe atrás).
        const fadeWindow = Math.max(0.001, duration - VIDEO_FADE_START_SECONDS);
        const fadeOpacity = targetTime <= VIDEO_FADE_START_SECONDS ? 1 : Math.max(0, 1 - (targetTime - VIDEO_FADE_START_SECONDS) / fadeWindow);
        track.style.setProperty("--hero-fade-opacity", fadeOpacity.toString());
        // Quase invisível (opacity < 5%) também não deve mais capturar
        // clique — sem isso, os links do menu ficariam "fantasmas" por
        // cima da próxima seção bem no fim da dissolução.
        track.style.setProperty("--hero-pointer-events", fadeOpacity < 0.05 ? "none" : "auto");
      }
    };

    const handleLoadedMetadata = () => {
      duration = video.duration || 0;
      updateScrub();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    // Vídeo já em cache do navegador pode nunca disparar o evento acima.
    if (video.readyState >= 1) handleLoadedMetadata();

    const onScrollOrResize = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(updateScrub);
    };

    updateScrub();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [trackRef, videoRef, progressRef]);
}

/** Organism `HeroSection` — vídeo do casal amarrado à rolagem + cena three.js decorativa por cima. */
export function HeroSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef(0);

  useScrollScrubVideo(trackRef, videoRef, progressRef);

  return (
    <div ref={trackRef} className="relative" style={{ height: `${SCROLL_TRACK_VH}vh` }}>
      <section
        id="topo"
        className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
        style={{
          opacity: "var(--hero-fade-opacity, 1)",
          pointerEvents: "var(--hero-pointer-events, auto)" as CSSProperties["pointerEvents"],
        }}
      >
        <video
          ref={videoRef}
          className="absolute inset-0 -z-20 h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
          poster="/hero/banner-hero-poster.jpg"
          aria-hidden="true"
        >
          <source src="/hero/banner-hero.webm" type="video/webm" />
          <source src="/hero/banner-hero.mp4" type="video/mp4" />
        </video>
        {/*
          Scrim gradiente (mais escuro no centro/base, onde fica o texto;
          quase transparente nas bordas) — garante contraste em qualquer
          frame do vídeo sem esconder o vídeo inteiro atrás de um véu chapado.
        */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 65%, rgba(34,27,25,0.55) 0%, rgba(34,27,25,0.25) 45%, rgba(34,27,25,0.05) 75%)",
          }}
          aria-hidden="true"
        />

        <HeroScene progressRef={progressRef} />

        {/*
          Caligrafia de entrada — só existe no primeiro momento (progress
          perto de 0) e some assim que a rolagem começa. `opacity` via
          `clamp()` lendo `--hero-progress` direto no CSS: acompanha o dedo
          no scroll 1:1, sem esperar um re-render do React. `pointer-events:
          none` porque é só assinatura decorativa — nunca deve capturar
          clique, nem depois de sumir.
        */}
        <p
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6 text-center font-script leading-none text-white"
          style={{
            fontSize: "clamp(3.5rem, 12vw, 8rem)",
            textShadow: "0 2px 24px rgba(34,27,25,0.35)",
            opacity: `clamp(0, calc(1 - (var(--hero-progress, 0) / ${CALLIGRAPHY_FADE_END})), 1)`,
          }}
        >
          Gabriela &amp; Emanuel
        </p>

        {/*
          Bloco de conteúdo padrão — some no primeiro frame (junto com a
          caligrafia acima) e some *dentro* (fade-in) assim que a rolagem
          começa, no mesmo intervalo (`CALLIGRAPHY_FADE_END`) em que a
          caligrafia se apaga: um crossfade, não uma sobreposição das duas.

          `style={{ color }}` em vez de uma classe Tailwind `text-white` nos
          filhos: Text/Heading já aplicam sua própria classe de cor por
          `tone` (mesma especificidade CSS de qualquer outra classe de cor),
          então a ordem de precedência entre duas classes de utilitário não
          é garantida pela ordem em que aparecem no `className` — só o
          atributo `style` tem prioridade garantida sobre elas.
        */}
        <div
          className="relative z-10 flex max-w-2xl flex-col items-center gap-field-gap"
          style={{ opacity: `clamp(0, calc(var(--hero-progress, 0) / ${CALLIGRAPHY_FADE_END}), 1)` }}
        >
          {/*
            `textShadow` em todo o bloco, não só na caligrafia: o vídeo se
            move (o scrim sozinho é mais fraco nas bordas da elipse), então
            sem isso o texto ficaria pouco legível em trechos mais claros do
            vídeo (ex.: céu aberto atrás da árvore) — visto num preview
            estático do primeiro frame durante a revisão final.
          */}
          <Text
            tone="secondary"
            className="uppercase tracking-[0.3em] text-100"
            style={{ color: "rgba(255,255,255,0.9)", textShadow: "0 1px 12px rgba(34,27,25,0.5)" }}
          >
            Vamos nos casar
          </Text>
          <Heading as="h1" size="xl" style={{ color: "#ffffff", textShadow: "0 2px 20px rgba(34,27,25,0.5)" }}>
            Gabriela &amp; Emanuel
          </Heading>
          <Text
            tone="secondary"
            className="text-400"
            style={{ color: "rgba(255,255,255,0.9)", textShadow: "0 1px 12px rgba(34,27,25,0.5)" }}
          >
            17 de abril de 2027
          </Text>
          <Text className="max-w-lg" style={{ color: "rgba(255,255,255,0.95)", textShadow: "0 1px 10px rgba(34,27,25,0.45)" }}>
            Com o coração cheio de alegria, convidamos você para celebrar ao nosso lado o começo de uma nova
            história. Sua presença é o presente que mais desejamos.
          </Text>
          <nav className="mt-4 flex flex-wrap justify-center gap-4 font-body text-100">
            <a
              href="#historia"
              className="rounded-pill border border-white/60 bg-white/10 px-5 py-2 text-white backdrop-blur-sm hover:bg-white/20"
            >
              Nossa história
            </a>
            <a
              href="#evento"
              className="rounded-pill border border-white/60 bg-white/10 px-5 py-2 text-white backdrop-blur-sm hover:bg-white/20"
            >
              O evento
            </a>
            <a
              href="#recomendacoes"
              className="rounded-pill border border-white/60 bg-white/10 px-5 py-2 text-white backdrop-blur-sm hover:bg-white/20"
            >
              Hospedagem e restaurantes
            </a>
          </nav>
        </div>
      </section>
    </div>
  );
}
