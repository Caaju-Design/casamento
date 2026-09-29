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
    // últimos valores escritos: só mexe nas variáveis do :root quando mudam
    // (escrever no :root a cada rolagem força recalcular o estilo da página
    // inteira — no celular isso vira engasgo mesmo lá embaixo do site)
    let last = { progress: -1, reveal: -1, pe: "" };

    const update = () => {
      rafId = null;
      const rect = track.getBoundingClientRect();
      // Altura da "tela" = a do quadro fixo do hero (100vh, que no celular é
      // a tela SEM a barra do navegador e não muda). Antes usava
      // window.innerHeight, que muda toda vez que a barra de endereço some ou
      // volta (é exatamente quando a pessoa inverte o sentido da rolagem) —
      // e isso fazia a pintura e a logo darem um salto.
      const stage = (track.firstElementChild as HTMLElement | null)?.offsetHeight || window.innerHeight;
      const scrollable = rect.height - stage;
      const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
      progressRef.current = progress;

      const fade = progress <= HERO_FADE_START ? 1 : Math.max(0, 1 - (progress - HERO_FADE_START) / (1 - HERO_FADE_START));
      const reveal = 1 - fade;
      const pe = reveal > 0.5 ? "auto" : "none";
      const p4 = Math.round(progress * 10000) / 10000;
      const r4 = Math.round(reveal * 10000) / 10000;
      if (p4 !== last.progress) root.style.setProperty("--hero-progress", p4.toString());
      if (r4 !== last.reveal) root.style.setProperty("--hero-reveal", r4.toString());
      if (pe !== last.pe) root.style.setProperty("--hero-reveal-pointer-events", pe);
      last = { progress: p4, reveal: r4, pe };
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
export function HeroSection({
  labels = { h1: "Gabriela & Emanuel — vamos nos casar em 17 de abril de 2027", loading: "Preparando a pintura:", ready: "Pronto", scroll: "Role para baixo" },
}: {
  labels?: { h1: string; loading: string; ready: string; scroll: string };
}) {
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
          Abertura com a identidade do casamento: só o monograma G&E, em
          branco chapado direto sobre a aquarela (pedido do casal: sem
          halo/respiro de papel por trás e sem os nomes escritos). Só existe no primeiro
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
          {/* só a logo do casal (os nomes escritos saíram a pedido do Manu) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-ge-branca.svg"
            alt=""
            width={470}
            height={401}
            className="h-auto"
            style={{ width: "clamp(8.5rem, 26vw, 15rem)" }}
          />
        </div>

        {/*
          O cartão com "Vamos nos casar / nomes / data / botões" que aparecia
          no fim da rolagem foi removido a pedido do casal ("aparecendo no meio
          do caminho"). O <h1> da página continua existindo, só que visível
          apenas pra leitores de tela; a abertura com a logo já faz esse
          papel visualmente.
        */}
        <h1 className="sr-only">{labels.h1}</h1>

        {/*
          Dica de rolagem (pedido do Manu: o pessoal ficava parado no hero sem
          saber o que fazer). Só o texto "Role para baixo" (sem fundo) no pé da tela — branco (sobre
          a aquarela); no celular fica logo abaixo da logo (a pintura desce ~0,5× a largura
          da tela a partir do centro), pra não cair no papel branco + seta, flutuando devagar pra cima e pra baixo; some junto com a logo quando a rolagem
          começa. Clicar rola um pouco, pra pintura começar a andar.
        */}
        <div
          className="absolute inset-x-0 top-[calc(50svh+34vw)] z-30 md:bottom-[max(1.5rem,env(safe-area-inset-bottom))] md:top-auto flex justify-center"
          style={{ opacity: `clamp(0, calc(1 - (var(--hero-progress, 0) / ${CALLIGRAPHY_FADE_END})), 1)` }}
        >
          <button
            type="button"
            onClick={() => window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" })}
            className="hero-hint-float group flex flex-col items-center gap-1.5 rounded-pill px-5 pb-2.5 pt-2 font-body text-100 font-bold uppercase tracking-[0.24em] text-white [text-shadow:0_1px_8px_rgba(45,43,35,0.55)] transition-colors hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-border-focus"
          >
            {labels.scroll}
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 text-white drop-shadow-[0_1px_6px_rgba(45,43,35,0.55)]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>
      </section>
      {lockForHero && (
        <HeroPreloader
          progress={phase === "loading" ? loadFraction / PRELOAD_READY_FRACTION : 1}
          done={phase !== "loading"}
          labels={labels}
        />
      )}
    </div>
  );
}
