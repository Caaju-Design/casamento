"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { FrameStore, type FrameSet } from "@/components/three/watercolor/frames";
import { WatercolorEngine, type StainPreset } from "@/components/three/watercolor/engine";

/**
 * Canvas em aquarela para as seções da "Nossa história": o mesmo motor do
 * hero (manchas de tinta revelando uma sequência de quadros de vídeo), só que
 * preenchendo o painel onde ele está (`fit: "cover"`), sem preloader e sem
 * travar a rolagem:
 *
 *  - os quadros só começam a baixar quando a seção está chegando perto da
 *    tela (1,5 tela de antecedência) — não disputam banda com o hero;
 *  - quando o painel aparece, as primeiras aguadas caem sozinhas;
 *  - dali em diante a rolagem da seção (`progressRef`, 0→1) faz a tinta cair
 *    e o vídeo andar, igual ao hero;
 *  - fora da tela o loop não desenha nada (bateria).
 * Se WebGL falhar, mostra o último quadro como imagem comum.
 */

export type SceneFrames = { desktop: FrameSet; mobile: FrameSet; aspect: number };

export interface WatercolorSceneProps {
  frames: SceneFrames;
  /** Progresso da rolagem da seção (0→1), escrito pelo pai sem re-render. */
  progressRef: RefObject<number>;
  /** Fração da rolagem em que a pintura fica completa. */
  paintCompleteAt?: number;
  /** Fração da rolagem em que a tinta começa a cair (pra uma pintura vir depois da outra). */
  paintStart?: number;
  /** Primeiras aguadas caem sozinhas quando o painel aparece (padrão: sim). */
  intro?: boolean;
  /** Canvas transparente fora da tinta — pra pintar uma foto por cima de outra. */
  transparent?: boolean;
  /** Margem de papel onde a tinta termina antes da borda (em alturas do canvas). */
  edgeFade?: number;
  stains: StainPreset;
  className?: string;
}

const INTRO_SHARE = 0.2;
const INTRO_MS = 2000;

function isLiteDevice() {
  const small = Math.min(window.screen.width, window.screen.height) < 768;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  return small || coarse;
}

export function WatercolorScene({
  frames,
  progressRef,
  paintCompleteAt = 0.6,
  paintStart = 0,
  intro = true,
  transparent = false,
  edgeFade = 0.07,
  stains,
  className,
}: WatercolorSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let disposed = false;
    let started = false;
    let raf = 0;
    let engine: WatercolorEngine | null = null;
    let store: FrameStore | null = null;
    let visible = false;
    let introAt = -1;
    let ready = false;
    let dirty = true;
    let shown = 0;
    let lastT = performance.now();
    let lastCenter = -1;
    const lite = isLiteDevice();
    const markDirty = () => {
      dirty = true;
    };
    const fail = () => {
      if (disposed) return;
      setFailed(true);
    };

    const resize = () => {
      if (!engine) return;
      const r = container.getBoundingClientRect();
      engine.resize(Math.max(1, r.width), Math.max(1, r.height), Math.min(window.devicePixelRatio || 1, 1.5));
      dirty = true;
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!engine || !store || !ready || !visible) return;
      const dt = Math.min(0.1, (now - lastT) / 1000);
      lastT = now;
      if (introAt < 0) introAt = now;

      const target = progressRef.current ?? 0;
      const k = 1 - Math.exp(-dt * 10);
      const next = Math.abs(target - shown) < 1e-4 ? target : shown + (target - shown) * k;
      if (next !== shown) {
        shown = next;
        dirty = true;
      }
      const introT = intro ? Math.min(1, (now - introAt) / INTRO_MS) : 1;
      if (introT < 1) dirty = true;
      if (!dirty) return;
      dirty = false;

      const introShare = intro ? INTRO_SHARE : 0;
      const span = Math.max(1e-3, paintCompleteAt - paintStart);
      const scrollPaint = Math.min(1, Math.max(0, (shown - paintStart) / span));
      const paint = Math.min(1, introShare * (1 - Math.pow(1 - introT, 3)) + (1 - introShare) * scrollPaint);
      const f = shown * (store.count - 1);
      const ia = Math.floor(f);
      const ib = Math.min(store.count - 1, ia + 1);
      if (ia !== lastCenter) {
        lastCenter = ia;
        store.ensureWindow(ia, markDirty, engine.texturesInUse);
      }
      const a = store.nearestDecoded(ia);
      const b = store.nearestDecoded(ib);
      const exact = a && b && a.index === ia && b.index === ib;
      try {
        engine.render(paint, a, exact ? b : null, exact ? f - ia : 0, 0.5);
      } catch {
        fail();
      }
    };

    const start = async () => {
      started = true;
      try {
        const noise = await new THREE.TextureLoader().loadAsync("/hero/aquarela/noise.png");
        if (disposed) return;
        engine = new WatercolorEngine(canvas, { lite, noise, imageAspect: frames.aspect, fit: "cover", stains, edgeFade, transparent });
      } catch {
        fail();
        return;
      }
      canvas.addEventListener("webglcontextlost", fail);
      resize();
      store = new FrameStore(lite ? frames.mobile : frames.desktop);
      const s = store;
      raf = requestAnimationFrame(loop);
      let first = false;
      void s.loadAll(() => {
        if (disposed) return;
        dirty = true;
        lastCenter = -1;
        if (!first && s.isLoaded(0)) {
          first = true;
          void s.decode(0).then(() => {
            if (disposed) return;
            s.ensureWindow(0, markDirty);
            void s.decodePinned(markDirty);
            ready = true;
            dirty = true;
          });
        }
      });
    };

    // começa a baixar com antecedência; desenha só quando está na tela
    const near = new IntersectionObserver(
      (entries) => {
        if (!started && entries.some((e) => e.isIntersecting)) void start();
      },
      { rootMargin: "150% 0px 150% 0px" },
    );
    const onScreen = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (visible) {
          lastT = performance.now();
          dirty = true;
        }
      },
      { threshold: 0.15 },
    );
    near.observe(container);
    onScreen.observe(container);
    const ro = new ResizeObserver(() => resize());
    ro.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      near.disconnect();
      onScreen.disconnect();
      ro.disconnect();
      canvas.removeEventListener("webglcontextlost", fail);
      store?.dispose();
      engine?.dispose();
    };
  }, [frames, progressRef, paintCompleteAt, paintStart, intro, transparent, edgeFade, stains]);

  return (
    <div ref={containerRef} className={["relative", className].filter(Boolean).join(" ")} aria-hidden="true">
      {failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${frames.desktop.base}/${String(frames.desktop.count - 1).padStart(3, "0")}.webp`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      )}
    </div>
  );
}
