"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { WatercolorEngine, type StainPreset } from "@/components/three/watercolor/engine";

/**
 * Painel em aquarela com um VÍDEO TOCANDO (diferente do `WatercolorScene`,
 * em que a rolagem é que anda o vídeo quadro a quadro). A rolagem só faz a
 * tinta cair; o vídeo roda sozinho, mudo e em loop, enquanto o painel está
 * na tela. Pensado pra trechos curtos (15 s, ~1–2 MB).
 *
 *  - baixa o vídeo só quando a seção está chegando (1,5 tela antes);
 *  - toca quando aparece e pausa quando sai (bateria);
 *  - longe da tela devolve o contexto WebGL (remonta o canvas);
 *  - `onVideo` entrega o `<video>` pro pai sincronizar vários tocando juntos.
 * Se WebGL falhar, mostra o próprio vídeo, sem a aquarela.
 */

/** `desktop`/`mobile` sem extensão: existe `.mp4` (H.264, Safari/iPhone) e `.webm` (VP9). */
export type VideoSources = { desktop: string; mobile: string; poster: string; aspect: number };

/** H.264 quando o navegador toca (Safari, Chrome, Edge); senão VP9 (Chromium sem codecs proprietários, Firefox Linux). */
function pickExtension(el: HTMLVideoElement) {
  return el.canPlayType('video/mp4; codecs="avc1.4d401f"') ? "mp4" : "webm";
}

export interface WatercolorVideoProps {
  video: VideoSources;
  progressRef: RefObject<number>;
  paintStart?: number;
  paintCompleteAt?: number;
  intro?: boolean;
  transparent?: boolean;
  edgeFade?: number;
  stains: StainPreset;
  /** Recebe o `<video>` (ou null ao desmontar), pra tocar em sincronia com outros. */
  onVideo?: (el: HTMLVideoElement | null) => void;
  className?: string;
}

const INTRO_SHARE = 0.2;
const INTRO_MS = 2000;

function isLiteDevice() {
  const small = Math.min(window.screen.width, window.screen.height) < 768;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  return small || coarse;
}

export function WatercolorVideo({
  video,
  progressRef,
  paintStart = 0,
  paintCompleteAt = 0.6,
  intro = true,
  transparent = false,
  edgeFade = 0.07,
  stains,
  onVideo,
  className,
}: WatercolorVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [generation, setGeneration] = useState(0);
  const introDoneRef = useRef(false);
  const onVideoRef = useRef(onVideo);
  useEffect(() => {
    onVideoRef.current = onVideo;
  }, [onVideo]);

  // entrega o <video> pro pai (sincronia)
  useEffect(() => {
    const el = videoRef.current;
    onVideoRef.current?.(el);
    return () => onVideoRef.current?.(null);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const vid = videoRef.current;
    if (!container || !vid) return;

    let disposed = false;
    let started = false;
    let raf = 0;
    let engine: WatercolorEngine | null = null;
    let visible = false;
    let introAt = -1;
    let shown = 0;
    let lastT = performance.now();
    const lite = isLiteDevice();
    const fail = () => {
      if (!disposed) setFailed(true);
    };

    const resize = () => {
      if (!engine) return;
      const r = container.getBoundingClientRect();
      engine.resize(Math.max(1, r.width), Math.max(1, r.height), Math.min(window.devicePixelRatio || 1, 1.5));
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (!engine || !visible) return;
      const dt = Math.min(0.1, (now - lastT) / 1000);
      lastT = now;
      if (introAt < 0) introAt = now;
      if (introDoneRef.current) introAt = -Infinity;
      const target = progressRef.current ?? 0;
      const k = 1 - Math.exp(-dt * 10);
      shown = Math.abs(target - shown) < 1e-4 ? target : shown + (target - shown) * k;
      const introT = intro ? Math.min(1, (now - introAt) / INTRO_MS) : 1;
      if (introT >= 1) introDoneRef.current = true;
      const introShare = intro ? INTRO_SHARE : 0;
      const span = Math.max(1e-3, paintCompleteAt - paintStart);
      const scrollPaint = Math.min(1, Math.max(0, (shown - paintStart) / span));
      const paint = Math.min(1, introShare * (1 - Math.pow(1 - introT, 3)) + (1 - introShare) * scrollPaint);
      // vídeo tocando = quadro novo a cada rAF, então desenha sempre
      try {
        engine.renderVideo(paint, vid);
      } catch {
        fail();
      }
    };

    const start = async () => {
      started = true;
      setSrc(`${lite ? video.mobile : video.desktop}.${pickExtension(vid)}`);
      if (!canvas) return;
      try {
        const noise = await new THREE.TextureLoader().loadAsync("/hero/aquarela/noise.png");
        if (disposed) return;
        engine = new WatercolorEngine(canvas, { lite, noise, imageAspect: video.aspect, fit: "cover", stains, edgeFade, transparent });
      } catch {
        fail();
        return;
      }
      canvas.addEventListener("webglcontextlost", fail);
      resize();
      raf = requestAnimationFrame(loop);
    };

    const near = new IntersectionObserver(
      (entries) => {
        const isNear = entries.some((e) => e.isIntersecting);
        if (!started && isNear) void start();
        else if (started && !isNear) setGeneration((g) => g + 1);
      },
      { rootMargin: "150% 0px 150% 0px" },
    );
    const onScreen = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (visible) {
          lastT = performance.now();
          // mudo + playsInline: o navegador deixa tocar sozinho (se o modo
          // economia do iPhone barrar, fica o primeiro quadro, pintado igual)
          vid.play().catch(() => undefined);
        } else {
          vid.pause();
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
      canvas?.removeEventListener("webglcontextlost", fail);
      engine?.dispose();
    };
  }, [video, progressRef, paintCompleteAt, paintStart, intro, transparent, edgeFade, stains, generation]);

  return (
    <div ref={containerRef} className={["relative", className].filter(Boolean).join(" ")} aria-hidden="true">
      {/* o <video> fica no DOM (o iPhone não decodifica vídeo solto), invisível
          atrás do canvas — a não ser que o WebGL falhe, aí ele aparece direto */}
      <video
        ref={videoRef}
        src={src}
        poster={video.poster}
        muted
        loop
        playsInline
        preload="auto"
        className={["absolute inset-0 h-full w-full object-cover", failed ? "" : "opacity-0"].join(" ")}
      />
      {!failed && <canvas key={generation} ref={canvasRef} className="absolute inset-0 block h-full w-full" />}
    </div>
  );
}
