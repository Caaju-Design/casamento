"use client";

import { useEffect, useRef, type RefObject } from "react";
import * as THREE from "three";
import { FRAME_SETS, FrameStore } from "@/components/three/watercolor/frames";
import { WatercolorEngine } from "@/components/three/watercolor/engine";
import { PAINT_COMPLETE_AT } from "@/components/three/watercolor/timing";

/** Parte da pintura que acontece sozinha ao chegar (primeiras aguadas), antes do scroll. */
const INTRO_SHARE = 0.16;
const INTRO_MS = 2400;

/**
 * Quanto precisa estar baixado pra liberar a rolagem. A ordem de download
 * "em peneira" (ver frames.ts) faz com que 50% já sejam um quadro sim, um
 * não, da sequência INTEIRA — o resto continua baixando em segundo plano e
 * a transição entre quadros vizinhos cobre a diferença.
 */
const READY_FRACTION = 0.5;
/** Rede muito lenta: depois disso, libera com o que tiver (mínimo abaixo) ou cai pro fallback. */
const LOAD_TIMEOUT_MS = 20000;
const MIN_FRACTION_ON_TIMEOUT = 0.25;

export interface WatercolorHeroProps {
  /** Progresso bruto da rolagem do hero (0→1), escrito por HeroSection sem re-render. */
  progressRef: RefObject<number>;
  /** Progresso do download dos quadros (0→1), pro preloader. */
  onLoadProgress: (fraction: number) => void;
  /** Quadros suficientes baixados e o primeiro já decodificado: pode liberar a rolagem. */
  onReady: () => void;
  /** WebGL indisponível, contexto perdido ou rede sem condição: usar a imagem estática. */
  onFallback: () => void;
}

function isLiteDevice() {
  if (typeof window === "undefined") return false;
  const small = Math.min(window.screen.width, window.screen.height) < 768;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  return small || coarse;
}

const smooth01 = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Canvas do hero em aquarela. Decorativo (aria-hidden); a lógica de rolagem fica em HeroSection. */
export function WatercolorHero({ progressRef, onLoadProgress, onReady, onFallback }: WatercolorHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // callbacks numa ref pra o efeito principal não reiniciar a cada render do pai
  const cb = useRef({ onLoadProgress, onReady, onFallback });
  useEffect(() => {
    cb.current = { onLoadProgress, onReady, onFallback };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let disposed = false;
    let failed = false;
    let raf = 0;
    const lite = isLiteDevice();
    const store = new FrameStore(lite ? FRAME_SETS.mobile : FRAME_SETS.desktop);
    let engine: WatercolorEngine | null = null;

    const fail = (reason?: unknown) => {
      if (failed || disposed) return;
      failed = true;
      console.warn("[hero-aquarela] usando imagem estática:", reason);
      cb.current.onFallback();
    };

    const onLost = () => fail("contexto WebGL perdido");

    // ---------------------------------------------------------- estado do loop
    let dirty = true;
    let readyAt = -1; // performance.now() de quando liberou (início das aguadas)
    let shown = 0; // progresso suavizado exibido
    let lastT = performance.now();
    let lastCenter = -1;
    const markDirty = () => {
      dirty = true;
    };

    const resize = () => {
      if (!engine) return;
      const r = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      engine.resize(Math.max(1, r.width), Math.max(1, r.height), dpr);
      dirty = true;
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!engine || readyAt < 0) return;
      const dt = Math.min(0.1, (now - lastT) / 1000);
      lastT = now;

      // Suaviza o scroll (acompanha o dedo, sem os "degraus" da roda do mouse).
      const target = progressRef.current ?? 0;
      const k = 1 - Math.exp(-dt * 10);
      const next = Math.abs(target - shown) < 1e-4 ? target : shown + (target - shown) * k;
      if (next !== shown) {
        shown = next;
        dirty = true;
      }

      const introT = Math.min(1, (now - readyAt) / INTRO_MS);
      if (introT < 1) dirty = true;
      if (!dirty) return;
      dirty = false;

      const introPaint = INTRO_SHARE * (1 - Math.pow(1 - introT, 3));
      const paint = Math.min(1, introPaint + (1 - INTRO_SHARE) * Math.min(1, shown / PAINT_COMPLETE_AT));

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
      const focusU = 0.5 + 0.1 * smooth01(0.35, 0.7, shown);
      try {
        engine.render(paint, a, exact ? b : null, exact ? f - ia : 0, focusU);
      } catch (err) {
        fail(err);
      }
    };

    const start = async () => {
      try {
        engine = new WatercolorEngine(canvas, {
          lite,
          noise: await new THREE.TextureLoader().loadAsync("/hero/aquarela/noise.png"),
        });
      } catch (err) {
        fail(err);
        return;
      }
      if (disposed) return;
      canvas.addEventListener("webglcontextlost", onLost);
      resize();
      raf = requestAnimationFrame(loop);

      let released = false;
      const release = async () => {
        if (released || disposed || failed) return;
        released = true;
        await store.decode(0);
        if (disposed || failed) return;
        store.ensureWindow(0, markDirty);
        readyAt = performance.now();
        dirty = true;
        cb.current.onReady();
        void store.decodePinned(markDirty);
      };

      const timeout = window.setTimeout(() => {
        if (released) return;
        if (store.loaded / store.count >= MIN_FRACTION_ON_TIMEOUT) void release();
        else fail("tempo esgotado baixando os quadros");
      }, LOAD_TIMEOUT_MS);

      await store.loadAll((fraction) => {
        if (disposed) return;
        cb.current.onLoadProgress(fraction);
        if (released) lastCenter = -1; // quadro novo baixado: reavalia a janela no próximo frame
        dirty = true;
        if (fraction >= READY_FRACTION && store.isLoaded(0)) void release();
      });
      window.clearTimeout(timeout);
      if (!released && !disposed) {
        if (store.isLoaded(0)) void release();
        else fail("quadros não baixaram");
      }
    };

    void start();

    const ro = new ResizeObserver(() => resize());
    ro.observe(container);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("webglcontextlost", onLost);
      store.dispose();
      engine?.dispose();
      engine = null;
    };
  }, [progressRef]);

  return (
    <div ref={containerRef} className="absolute inset-0" aria-hidden="true">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
