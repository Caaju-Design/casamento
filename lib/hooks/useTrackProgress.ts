"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

/**
 * Progresso (0→1) da pintura de um capítulo da história.
 *
 * Pedido da Gabi: as fotos surgem SOZINHAS quando a pessoa chega na tela,
 * sem depender de continuar rolando. Então o progresso agora é por TEMPO:
 * quando o topo do trilho chega perto do topo da tela, dispara uma animação
 * de `durationMs` que leva o progresso de 0 a 1 (com suavização) e fica em
 * 1 dali em diante. Quem desenha continua lendo a ref a cada quadro, então
 * as colagens com várias fotos continuam aparecendo uma depois da outra.
 *
 * Com "reduzir movimento", vai direto pro fim.
 */
export function useTrackProgress(trackRef: RefObject<HTMLElement | null>, durationMs = 4200) {
  const progressRef = useRef(0);
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf: number | null = null;
    let started = false;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const play = () => {
      started = true;
      if (reduce) {
        progressRef.current = 1;
        return;
      }
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / durationMs);
        // easeInOutSine: começa e termina macio
        progressRef.current = 0.5 - Math.cos(Math.PI * t) / 2;
        raf = t < 1 ? requestAnimationFrame(tick) : null;
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (started) return;
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          play();
        }
      },
      // dispara quando a tela do capítulo já ocupa boa parte da janela
      { rootMargin: "0px 0px -35% 0px" },
    );
    io.observe(track);
    return () => {
      io.disconnect();
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [trackRef, durationMs]);
  return progressRef;
}
