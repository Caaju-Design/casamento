"use client";

import dynamic from "next/dynamic";
import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { HeroPreloader } from "@/components/molecules/HeroPreloader";
import { PAINT_COMPLETE_AT } from "@/components/three/watercolor/timing";
import { Heading } from "@/components/atoms/Heading";
import { Text } from "@/components/atoms/Text";

// A cena three.js (e o próprio @react-three/fiber) só existe no navegador —
// carregada com `ssr: false` para nunca ser executada durante o
// pré-renderização no servidor (puramente decorativa, sem papel funcional).
const HeroScene = dynamic(() => import("@/components/three/HeroScene").then((mod) => mod.HeroScene), {
  ssr: false,
});
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
 * Efeito puramente decorativo — mesma exceção de `prefers-reduced-motion`
 * já documentada em components/three/HeroScene.tsx e
 * docs/design-system/acessibilidade.md (decisão de produto do casal, não do
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
 *  - `--hero-video-opacity`: opacidade da camada pintada (nome mantido do
 *    hero antigo em vídeo pra não quebrar quem lê): 1 durante a pintura,
 *    dissolvendo pra 0 de `HERO_FADE_START` até o fim do trilho.
 *  - `--hero-reveal`: o inverso (0→1) — bloco de conteúdo e menu de âncoras.
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
      root.style.setProperty("--hero-video-opacity", fade.toString());
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
      root.style.removeProperty("--hero-video-opacity");
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

/** Organism `HeroSection` — pintura em aquarela do casal amarrada à rolagem + pétalas decorativas por cima. */
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
          pintura final como imagem estática). Opacidade 1 durante toda a
          pintura, dissolvendo na janela final (`HERO_FADE_START` → fim).
          `pointer-events: none`: puramente decorativa.

          As pétalas (HeroScene) ficam DE FORA desta div de propósito — se
          ficassem dentro, herdariam a opacidade e sumiriam junto no fim.
        */}
        <div
          className="absolute inset-0 -z-20 bg-page"
          style={{ opacity: "var(--hero-video-opacity, 1)", pointerEvents: "none" }}
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

        {phase !== "loading" && <HeroScene progressRef={progressRef} showSun={false} />}

        {/*
          Caligrafia de entrada — só existe no primeiro momento (progress
          perto de 0) e some assim que a rolagem começa. `opacity` via
          `clamp()` lendo `--hero-progress` direto no CSS: acompanha o dedo
          no scroll 1:1, sem esperar um re-render do React. `pointer-events:
          none` porque é só assinatura decorativa — nunca deve capturar
          clique, nem depois de sumir.

          Layout diferente por tamanho de tela, não um `flex-wrap` que
          quebra sozinho: no mobile (padrão, sem prefixo) é
          `flex-col items-center text-center` — "Gabriela" e "Emanuel"
          empilhados e centralizados horizontalmente (era `items-start
          text-left`, ficava tudo grudado na margem esquerda — pedido
          explícito pra centralizar), com o "&" (menor) entre os dois,
          também centralizado, tipo uma assinatura. A partir de `sm:` vira
          `flex-row items-center justify-center` — os 3 numa linha só,
          centralizados, "Gabriela & Emanuel" corrido (o texto original).

          `sm:gap-10` (não mais `sm:gap-4`) no desktop: com a fonte
          script gigante (`clamp(..., 8rem)`) 1rem de respiro entre os
          `<span>` lia como colado — as curvas do "a" final de "Gabriela"
          quase encostavam no "&", e o "&" quase encostava no "E" de
          "Emanuel" (reportado como "falta espaço"). Faixa maior de gap dá
          folga visível nesse tamanho de fonte. `mx-1` extra direto no "&"
          (que já é 0.55em menor que o resto) reforça essa respiração dos
          dois lados independente do `gap`, porque o próprio glifo "&" da
          Fleur De Leah tem bastante peso visual grudado nas bordas.
        */}
        <p
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-1 px-6 text-center font-script leading-none text-ink-700 sm:flex-row sm:gap-10"
          style={{
            fontSize: "clamp(3.5rem, 12vw, 8rem)",
            // tinta escura sobre papel/aquarela, com um halo de papel pra
            // continuar legível quando cai em cima de uma mancha escura
            textShadow: "0 0 18px rgba(255,250,243,0.9), 0 0 4px rgba(255,250,243,0.8)",
            opacity: `clamp(0, calc(1 - (var(--hero-progress, 0) / ${CALLIGRAPHY_FADE_END})), 1)`,
          }}
        >
          <span>Gabriela</span>
          <span className="mx-1 self-center sm:self-auto" style={{ fontSize: "0.55em" }}>
            &amp;
          </span>
          <span>Emanuel</span>
        </p>

        {/*
          Bloco de conteúdo padrão — fica invisível durante toda a rolagem
          principal do vídeo e só aparece (fade-in) na janela final
          (`VIDEO_FADE_START_SECONDS` → fim), em sincronia exata com a
          dissolução da camada do vídeo (`--hero-reveal` é sempre
          `1 - videoOpacity`). `pointerEvents` some junto: só fica clicável
          quando o reveal já está visualmente quase completo.

          Cores normais do design system (não mais branco com sombra): a
          essa altura da rolagem o vídeo já sumiu quase por completo, então
          o fundo por trás é o `bg-page` (creme) normal do site — texto
          branco ficava ilegível (branco sobre quase-branco). O fundo
          (`bg-page/90` + blur) garante leitura mesmo no meio da transição,
          quando ainda sobra um resto do vídeo por trás.
        */}
        <div
          className="relative z-10 flex max-w-2xl flex-col items-center gap-field-gap rounded-card bg-page/90 px-8 py-10 shadow-lg backdrop-blur-sm"
          style={{
            opacity: "var(--hero-reveal, 0)",
            pointerEvents: "var(--hero-reveal-pointer-events, none)" as CSSProperties["pointerEvents"],
          }}
        >
          <Text tone="secondary" className="uppercase tracking-[0.3em] text-100">
            Vamos nos casar
          </Text>
          <Heading as="h1" size="xl">
            Gabriela &amp; Emanuel
          </Heading>
          <Text tone="secondary" className="text-400">
            17 de abril de 2027
          </Text>
          <Text className="max-w-lg">
            Com o coração cheio de alegria, convidamos você para celebrar ao nosso lado o começo de uma nova
            história. Sua presença é o presente que mais desejamos.
          </Text>
          <nav className="mt-4 flex flex-wrap justify-center gap-4 font-body text-100">
            <a
              href="#historia"
              className="rounded-pill border border-border-subtle bg-surface px-5 py-2 text-text-primary transition-colors hover:bg-blush-50"
            >
              Nossa história
            </a>
            <a
              href="#evento"
              className="rounded-pill border border-border-subtle bg-surface px-5 py-2 text-text-primary transition-colors hover:bg-blush-50"
            >
              O evento
            </a>
            <a
              href="#recomendacoes"
              className="rounded-pill border border-border-subtle bg-surface px-5 py-2 text-text-primary transition-colors hover:bg-blush-50"
            >
              Hospedagem e restaurantes
            </a>
          </nav>
        </div>
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
