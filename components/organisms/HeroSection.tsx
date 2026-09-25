"use client";

import dynamic from "next/dynamic";
import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { HeroPreloader } from "@/components/molecules/HeroPreloader";
import { PAINT_COMPLETE_AT } from "@/components/three/watercolor/timing";

// O canvas em aquarela (three.js) só existe no navegador — carregado com
// `ssr: false` pra nunca rodar na pré-renderização do servidor.
const WatercolorHero = dynamic(
  () => import("@/components/three/WatercolorHero").then((mod) => mod.WatercolorHero),
  { ssr: false },
);

/** Quanto do download libera a rolagem (ver READY_FRACTION em WatercolorHero). A barra do preloader chega a 100% nesse ponto. */
const PRELOAD_READY_FRACTION = 0.5;

/**
 * Altura do "trilho" de rolagem do hero, em múltiplos da viewport. A pintura
 * fica pinada (`position: sticky`) enquanto o usuário rola por essa
 * distância — 1 unidade a mais de altura vira 1 viewport a mais de rolagem
 * pra câmera andar e a tinta cair.
 *
 * Efeito puramente decorativo — exceção de `prefers-reduced-motion`
 * documentada em docs/design-system/acessibilidade.md (decisão de produto do casal, não do
 * agente).
 */
const SCROLL_TRACK_VH = 300;

/**
 * Fração do progresso de rolagem (0 a 1) em que a caligrafia de entrada
 * termina de sumir — lê `--hero-progress` (setada em `document.documentElement`
 * por `useHeroScrollProgress`) e faz o próprio fade em CSS puro (`clamp()`),
 * sem re-render do React a cada frame de scroll. Ao contrário do bloco de
 * conteúdo padrão (ver `--hero-reveal` abaixo), a caligrafia só tem essa
 * janela de saída — ela não volta a aparecer depois.
 */
const CALLIGRAPHY_FADE_END = 0.12;

/**
 * Fração da rolagem em que a camada do hero começa a dissolver pro bloco de
 * conteúdo. Vem do hero antigo em vídeo (6.8s de 10.04s — o casal já está na
 * pose do beijo e segura até o fim) e continua valendo: a pintura termina
 * exatamente aqui (`PAINT_COMPLETE_AT`) e aí o conteúdo sobe por cima.
 */
const HERO_FADE_START = PAINT_COMPLETE_AT;

/**
 * Amarra o progresso do hero à posição de rolagem do "trilho" (`trackRef`).
 *
 * Publica o estado em CSS custom properties no `document.documentElement`
 * (não num elemento local!) — assim o `AnchorNav`, que é *irmão* do hero em
 * `HomePageTemplate`, lê o mesmo estado por herança de CSS, sem context:
 *
 *  - `--hero-progress`: 0→1, progresso bruto de rolagem pelo trilho inteiro.
 *  - `--hero-reveal`: 0 durante a pintura, subindo pra 1 de `HERO_FADE_START`
 *    até o fim do trilho — é quando o menu de âncoras (AnchorNav) aparece.
 *  - `--hero-reveal-pointer-events`: "none" até o reveal estar quase completo.
 *
 * Não existe mais `<video>` nem seek: o progresso vai pra `progressRef` e o
 * canvas em aquarela (WatercolorHero) desenha o quadro certo sozinho.
 */
function useHeroScrollProgress(trackRef: RefObject<HTMLDivElement | null>, progressRef: RefObject<number>) {
  useLayoutEffect(() => {
    const track = trackRef.current;
    const root = document.documentElement;
    if (!track) return;
    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      const rect = track.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
      progressRef.current = progress;

      const fade = progress <= HERO_FADE_START ? 1 : Math.max(0, 1 - (progress - HERO_FADE_START) / (1 - HERO_FADE_START));
      const reveal = 1 - fade;
      root.style.setProperty("--hero-progress", progress.toString());
      root.style.setProperty("--hero-reveal", reveal.toString());
      root.style.setProperty("--hero-reveal-pointer-events", reveal > 0.5 ? "auto" : "none");
    };

    const onScrollOrResize = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
      root.style.removeProperty("--hero-progress");
      root.style.removeProperty("--hero-reveal");
      root.style.removeProperty("--hero-reveal-pointer-events");
    };
  }, [trackRef, progressRef]);
}

type HeroPhase = "loading" | "ready" | "fallback";

/**
 * Decide se a rolagem fica travada enquanto a pintura carrega: só se a
 * pessoa chegou no topo. Quem abre um link direto pra `#evento`, por
 * exemplo, nem vê o preloader. Retorna `false` só depois de hidratar
 * (no HTML do servidor o preloader já nasce travando — ver HeroPreloader).
 */
function useShouldLockForHero(trackRef: RefObject<HTMLDivElement | null>) {
  const [lock, setLock] = useState(true);
  useLayoutEffect(() => {
    const track = trackRef.current;
    const nearTop = !location.hash && (!track || window.scrollY < track.offsetHeight * 0.5);
    if (nearTop) {
      // recarregar no meio do trilho voltaria a um hero "a meio caminho"
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
    } else {
      setLock(false);
    }
  }, [trackRef]);
  return lock;
}

/** Organism `HeroSection` — pintura em aquarela do casal amarrada à rolagem. */
export function HeroSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [phase, setPhase] = useState<HeroPhase>("loading");
  const [loadFraction, setLoadFraction] = useState(0);

  useHeroScrollProgress(trackRef, progressRef);
  const lockForHero = useShouldLockForHero(trackRef);

  const handleLoadProgress = useCallback((f: number) => setLoadFraction(f), []);
  const handleReady = useCallback(() => setPhase((p) => (p === "loading" ? "ready" : p)), []);
  const handleFallback = useCallback(() => setPhase("fallback"), []);

  return (
    <div ref={trackRef} className="relative" style={{ height: `${SCROLL_TRACK_VH}vh` }}>
      <section
        id="topo"
        className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden px-6 text-center"
      >
        {/*
          Camada pintada — canvas em aquarela (ou, se WebGL/rede falharem, a
          pintura final como imagem estática). Não dissolve mais no fim: a
          pintura fica inteira e sobe junto com a página quando o trilho
          acaba, emendando direto na "Nossa história".
          `pointer-events: none`: puramente decorativa.
        */}
        <div
          className="pointer-events-none absolute inset-0 -z-20 bg-page"
          aria-hidden="true"
        >
          {phase === "fallback" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/hero/aquarela/fallback.webp"
              alt=""
              className="absolute inset-0 h-full w-full object-contain sm:object-cover"
            />
          ) : (
            <WatercolorHero
              progressRef={progressRef}
              onLoadProgress={handleLoadProgress}
              onReady={handleReady}
              onFallback={handleFallback}
            />
          )}
        </div>

        {/*
          Abertura com a identidade do casamento: monograma G&E + os nomes em
          Cochin, os dois em branco chapado direto sobre a aquarela (pedido do
          casal: sem halo/respiro de papel por trás). Só existe no primeiro
          momento (progress perto de 0) e some assim que a rolagem começa —
          `opacity` via `clamp()` lendo `--hero-progress` direto no CSS,
          acompanhando o dedo 1:1 sem re-render do React. Decorativo
          (`aria-hidden`, `pointer-events: none`): o título real da página é
          o <h1> do bloco de conteúdo abaixo.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
          style={{ opacity: `clamp(0, calc(1 - (var(--hero-progress, 0) / ${CALLIGRAPHY_FADE_END})), 1)` }}
        >
          <div className="flex flex-col items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/logo-ge-branca.svg"
              alt=""
              width={470}
              height={401}
              className="h-auto"
              style={{ width: "clamp(8.5rem, 26vw, 15rem)" }}
            />
            <p
              className="font-display uppercase text-white"
              style={{ fontSize: "clamp(0.95rem, 2.6vw, 1.35rem)", letterSpacing: "0.32em" }}
            >
              Gabriela &amp; Emanuel
            </p>
          </div>
        </div>

        {/*
          O cartão com "Vamos nos casar / nomes / data / botões" que aparecia
          no fim da rolagem foi removido a pedido do casal ("aparecendo no meio
          do caminho"). O <h1> da página continua existindo, só que visível
          apenas pra leitores de tela; a abertura com a logo já faz esse
          papel visualmente.
        */}
        <h1 className="sr-only">Gabriela &amp; Emanuel — vamos nos casar em 17 de abril de 2027</h1>
      </section>
      {lockForHero && (
        <HeroPreloader
          progress={phase === "loading" ? loadFraction / PRELOAD_READY_FRACTION : 1}
          done={phase !== "loading"}
        />
      )}
    </div>
  );
}
