"use client";

import { useEffect, useState } from "react";

export interface HeroPreloaderProps {
  /** 0→1: quanto da pintura (quadros do hero) já foi baixado. */
  progress: number;
  /** Quando vira `true`, o preloader dissolve e desmonta. */
  done: boolean;
}

/**
 * Molecule `HeroPreloader` — tela de papel com uma pincelada que vai se
 * enchendo de tinta enquanto os quadros do hero baixam.
 *
 * Existe por causa do bug relatado no celular: a pessoa rolava antes do
 * vídeo carregar e passava o hero inteiro com a imagem congelada. Agora a
 * rolagem só é liberada quando a pintura tem material pra acompanhar o dedo
 * de verdade. Fica por cima de tudo (`z-[70]`).
 *
 * A trava de rolagem é um `<style>` renderizado junto com o componente — ou
 * seja, já vem no HTML do servidor e vale desde o PRIMEIRO paint, antes do
 * JavaScript hidratar (no celular a hidratação pode levar segundos, e era
 * exatamente nessa janela que dava pra sair rolando com tudo congelado).
 */
export function HeroPreloader({ progress, done }: HeroPreloaderProps) {
  const [mounted, setMounted] = useState(true);
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);

  useEffect(() => {
    if (!done) return;
    const t = window.setTimeout(() => setMounted(false), 700);
    return () => window.clearTimeout(t);
  }, [done]);

  if (!mounted) return null;

  return (
    <div
      data-hero-preloader=""
      role="status"
      aria-live="polite"
      aria-label={done ? "Pronto" : `Preparando a pintura: ${pct}%`}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-6 bg-page px-6 text-center"
      style={{
        opacity: done ? 0 : 1,
        transition: "opacity 650ms ease",
        pointerEvents: done ? "none" : "auto",
        touchAction: "none",
      }}
    >
      {!done && (
        <style>{`html,body{overflow:hidden!important;overscroll-behavior:none;touch-action:none}`}</style>
      )}
      {/* sem JavaScript não tem pintura: nem trava nem mostra o preloader */}
      <noscript>
        <style>{`html,body{overflow:auto!important;touch-action:auto!important}[data-hero-preloader]{display:none!important}`}</style>
      </noscript>
      <p className="font-script leading-none text-ink-700" style={{ fontSize: "clamp(2.75rem, 9vw, 4.5rem)" }}>
        Gabriela <span style={{ fontSize: "0.55em" }}>&amp;</span> Emanuel
      </p>

      {/* Pincelada que se enche de tinta conforme o download avança */}
      <svg viewBox="0 0 320 40" className="w-64 max-w-[70vw]" aria-hidden="true">
        <defs>
          <filter id="hero-preloader-bleed" x="-10%" y="-60%" width="120%" height="220%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035 0.2" numOctaves="3" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="7" />
            <feGaussianBlur stdDeviation="0.6" />
          </filter>
          <clipPath id="hero-preloader-fill">
            <rect x="0" y="0" height="40" width={3.2 * pct} style={{ transition: "width 300ms ease" }} />
          </clipPath>
        </defs>
        {/* rastro seco do pincel (papel) */}
        <path
          d="M8 22 C 70 12, 140 30, 200 20 S 290 16, 312 21"
          fill="none"
          stroke="#a85a52"
          strokeOpacity="0.12"
          strokeWidth="14"
          strokeLinecap="round"
          filter="url(#hero-preloader-bleed)"
        />
        {/* tinta */}
        <g clipPath="url(#hero-preloader-fill)">
          <path
            d="M8 22 C 70 12, 140 30, 200 20 S 290 16, 312 21"
            fill="none"
            stroke="#a85a52"
            strokeOpacity="0.75"
            strokeWidth="14"
            strokeLinecap="round"
            filter="url(#hero-preloader-bleed)"
          />
        </g>
      </svg>

      <p className="font-body text-100 uppercase tracking-[0.3em] text-text-secondary">
        Preparando a pintura · {pct}%
      </p>
    </div>
  );
}
