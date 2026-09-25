"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";

/**
 * Progresso (0→1) da rolagem por um "trilho" mais alto que a tela, onde o
 * conteúdo fica preso (`position: sticky`). 0 quando o topo do trilho encosta
 * no topo da tela; 1 quando o fim do trilho encosta no fim da tela.
 * Escreve numa ref (sem re-render) — quem desenha lê a cada quadro.
 */
export function useTrackProgress(trackRef: RefObject<HTMLElement | null>) {
  const progressRef = useRef(0);
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf: number | null = null;
    const update = () => {
      raf = null;
      const rect = track.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      progressRef.current = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
    };
    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [trackRef]);
  return progressRef;
}
