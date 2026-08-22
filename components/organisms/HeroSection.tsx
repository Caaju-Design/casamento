"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useRef, type CSSProperties, type RefObject } from "react";
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
 * termina de sumir — lê `--hero-progress` (setada em `document.documentElement`
 * por `useScrollScrubVideo`) e faz o próprio fade em CSS puro (`clamp()`),
 * sem re-render do React a cada frame de scroll. Ao contrário do bloco de
 * conteúdo padrão (ver `--hero-reveal` abaixo), a caligrafia só tem essa
 * janela de saída — ela não volta a aparecer depois.
 */
const CALLIGRAPHY_FADE_END = 0.12;

/**
 * Segundo do vídeo (não fração de progresso — segundo de verdade) a partir
 * do qual a camada do vídeo (vídeo + scrim, a cena three.js fica de fora,
 * ver comentário mais abaixo) começa a dissolver, revelando o bloco de
 * conteúdo padrão do site (título, data, menu de âncoras) por trás — os
 * dois lados dessa dissolução terminam exatamente no último frame do
 * vídeo. Calculado contra `video.duration` em tempo real, então continua
 * correto se um dia o vídeo do hero for trocado por um de outra duração.
 *
 * Ajustado pra 6.8s (não os 8s originais) depois de conferir o material
 * bruto quadro a quadro: o casal já está praticamente na pose do beijo a
 * partir do 7º segundo e segura essa pose até o fim (10.04s) — é assim
 * mesmo a gravação, não é bug. Com o fade começando só no 8º segundo sobrava
 * pouco menos de 2s de dissolução pra cobrir os últimos 20% da rolagem
 * inteira, e a pose "parada" lia como o vídeo tendo travado. Começar a
 * dissolver um pouco antes (bem quando os dois se aproximam) faz o
 * "segurar a pose" virar parte do próprio efeito, em vez de um
 * congelamento antes dele.
 */
const VIDEO_FADE_START_SECONDS = 6.8;

/**
 * Amarra o `currentTime` de um `<video>` à posição de rolagem de um
 * elemento "trilho" mais alto que ele (`trackRef`), sem nunca chamar
 * `.play()` — o vídeo só avança via seek manual, então no primeiro
 * carregamento (progress = 0) ele fica parado no primeiro frame até o
 * usuário começar a rolar.
 *
 * Publica o estado de rolagem em CSS custom properties no
 * `document.documentElement` (não num elemento local do hero!) — assim tanto
 * o conteúdo interno do próprio `HeroSection` quanto o `AnchorNav`, que é
 * renderizado como *irmão* dele em `HomePageTemplate` (não descendente, então
 * não herdaria de uma custom property só do trilho), conseguem ler o mesmo
 * estado por herança de CSS, sem precisar de nenhum React context:
 *
 *  - `--hero-progress`: 0→1, progresso bruto de rolagem pelo trilho inteiro.
 *  - `--hero-video-opacity`: 1 durante toda a rolagem principal, dissolvendo
 *    pra 0 só na janela final (`VIDEO_FADE_START_SECONDS` → fim do vídeo).
 *  - `--hero-reveal`: o inverso do anterior (0→1) — o bloco de conteúdo
 *    padrão e o menu de âncoras usam essa variável, então ficam invisíveis
 *    durante toda a rolagem do vídeo e só aparecem, em sincronia, na mesma
 *    janela final em que o vídeo se dissolve.
 *  - `--hero-reveal-pointer-events`: "none" até o reveal estar quase
 *    completo, pra menu/links não ficarem clicáveis (nem focáveis por tab)
 *    enquanto ainda estão (quase) transparentes.
 */
function useScrollScrubVideo(
  trackRef: RefObject<HTMLDivElement | null>,
  videoRef: RefObject<HTMLVideoElement | null>,
  progressRef: RefObject<number>,
) {
  useLayoutEffect(() => {
    const video = videoRef.current;
    const track = trackRef.current;
    const root = document.documentElement;
    if (!video || !track) return;

    let duration = 0;
    let rafId: number | null = null;

    // Guarda contra seeks sobrepostos — a causa mais provável do "trava
    // mas a rolagem continua" relatado no mobile (iPhone/Brave): sem essa
    // guarda, cada frame de scroll dispara `video.currentTime = X` na
    // hora, mesmo que o seek anterior ainda não tenha terminado de
    // decodificar. Em decoders mais lentos (celular) isso enfileira vários
    // pedidos de seek mais rápido do que o vídeo consegue processar — a
    // imagem fica presa no frame do PRIMEIRO seek da fila enquanto
    // `--hero-progress` (e o resto da UI) já avançou muito além, e quando
    // o decoder enfim libera, ele pula direto pro último pedido, lendo
    // como "travou e depois deu um salto". A correção é nunca sobrepor:
    // só disparar um novo `currentTime` depois que o evento `seeked`
    // confirmar que o anterior terminou; se a rolagem mudou nesse meio
    // tempo, guarda só o alvo mais recente (`pendingSeekTime`) e aplica
    // ele assim que der, sem empilhar seeks intermediários.
    let isSeeking = false;
    let pendingSeekTime: number | null = null;
    let seekWatchdogId: ReturnType<typeof setTimeout> | null = null;

    const seekTo = (time: number) => {
      if (isSeeking) {
        pendingSeekTime = time;
        return;
      }
      // 0.12s (não mais 0.08s) — cada seek força o decoder a trabalhar; um
      // limiar maior dispara ainda menos seeks por segundo de scroll,
      // sobrando mais folga pro decoder de celular acompanhar.
      if (Math.abs(video.currentTime - time) <= 0.12) return;

      isSeeking = true;
      video.currentTime = time;

      // Watchdog: em tese todo `currentTime` dispara `seeked` mais cedo ou
      // mais tarde, mas navegadores têm bug (principalmente mobile) onde o
      // evento às vezes não dispara — sem isso, `isSeeking` ficaria preso
      // em `true` pra sempre e o vídeo pararia de responder ao scroll até
      // um recarregamento de página. Baixado de 400ms pra 180ms: era
      // exatamente esse tempo de espera que lia como "trava" no relato do
      // mobile — quando o `seeked` de fato não disparava, o vídeo ficava
      // 400ms sem reagir a scroll nenhum antes do watchdog liberar de novo.
      if (seekWatchdogId !== null) clearTimeout(seekWatchdogId);
      seekWatchdogId = setTimeout(() => {
        isSeeking = false;
        if (pendingSeekTime !== null) {
          const next = pendingSeekTime;
          pendingSeekTime = null;
          seekTo(next);
        }
      }, 180);
    };

    const handleSeeked = () => {
      isSeeking = false;
      if (seekWatchdogId !== null) {
        clearTimeout(seekWatchdogId);
        seekWatchdogId = null;
      }
      if (pendingSeekTime !== null) {
        const next = pendingSeekTime;
        pendingSeekTime = null;
        seekTo(next);
      }
    };
    video.addEventListener("seeked", handleSeeked);

    const updateScrub = () => {
      rafId = null;
      const rect = track.getBoundingClientRect();
      const scrollableDistance = rect.height - window.innerHeight;
      const progress = scrollableDistance > 0 ? Math.min(1, Math.max(0, -rect.top / scrollableDistance)) : 0;

      root.style.setProperty("--hero-progress", progress.toString());
      // Mesmo valor, mas como número puro numa ref — a cena three.js
      // (HeroScene) lê isso a cada frame do próprio loop de render dela,
      // sem precisar reler CSS nem re-renderizar o React.
      progressRef.current = progress;

      if (duration > 0) {
        const targetTime = progress * duration;
        seekTo(targetTime);

        // Dissolve final: vídeo em opacidade 1 até `VIDEO_FADE_START_SECONDS`,
        // depois cai pra 0 no último frame — só nesse trecho final é que a
        // camada do vídeo começa a sumir, revelando o bloco de conteúdo
        // padrão (título, data, menu) que sobe por trás em sincronia
        // (`--hero-reveal` é sempre `1 - videoOpacity`).
        const fadeWindow = Math.max(0.001, duration - VIDEO_FADE_START_SECONDS);
        const videoOpacity =
          targetTime <= VIDEO_FADE_START_SECONDS ? 1 : Math.max(0, 1 - (targetTime - VIDEO_FADE_START_SECONDS) / fadeWindow);
        const reveal = 1 - videoOpacity;

        root.style.setProperty("--hero-video-opacity", videoOpacity.toString());
        root.style.setProperty("--hero-reveal", reveal.toString());
        // Só fica clicável (e focável por tab) quando o reveal já está
        // visualmente quase completo — antes disso os links do menu e do
        // bloco de conteúdo ficariam "fantasmas" por cima do vídeo.
        root.style.setProperty("--hero-reveal-pointer-events", reveal > 0.5 ? "auto" : "none");
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
      video.removeEventListener("seeked", handleSeeked);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (seekWatchdogId !== null) clearTimeout(seekWatchdogId);
      // Ao desmontar o hero (nunca acontece nesta página hoje, mas evita
      // deixar `document.documentElement` com variáveis "presas" caso o
      // componente algum dia passe a ser condicional), devolve o menu ao
      // estado visível/clicável padrão.
      root.style.removeProperty("--hero-progress");
      root.style.removeProperty("--hero-video-opacity");
      root.style.removeProperty("--hero-reveal");
      root.style.removeProperty("--hero-reveal-pointer-events");
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
      >
        {/*
          Camada do vídeo — só vídeo + scrim, opacidade 1 durante toda a
          rolagem principal, dissolvendo na janela final (ver
          `VIDEO_FADE_START_SECONDS` → fim). `pointer-events: none` porque é
          puramente decorativa, nunca deve capturar clique nem enquanto
          visível.

          A cena three.js (pétalas + raio de sol) FICA DE FORA desta div de
          propósito: ela já reage ao progresso de rolagem com a própria
          lógica dela (`FallingPetals`/`SunRays` em HeroScene.tsx reduzem
          partículas e apagam o raio de sol conforme o scroll avança) — se
          ela ficasse dentro desta camada, herdaria TAMBÉM a opacidade do
          vídeo e sumiria de vez assim que o vídeo começasse a dissolver
          (foi exatamente o bug reportado: "sumiram as pétalas e o raio de
          sol"). Como componente próprio, continua viva e visível mesmo
          depois do vídeo já ter sumido de vez.
        */}
        <div
          className="absolute inset-0 -z-20"
          style={{ opacity: "var(--hero-video-opacity, 1)", pointerEvents: "none" }}
          aria-hidden="true"
        >
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            playsInline
            preload="auto"
            poster="/hero/banner-hero-poster.jpg"
            aria-hidden="true"
          >
            {/*
              Versão bem mais leve (854px de largura, em vez de 1920px —
              baixado de uma tentativa anterior de 1280px que ainda não foi
              suficiente pra sumir com o travamento relatado no iPhone) pra
              telas estreitas — celular é o cenário mais sensível ao
              travamento no scroll-scrub, porque cada seek força o decoder
              a decodificar de novo, e um vídeo menor decodifica bem mais
              rápido. O navegador testa os `<source>` na ordem e usa o
              primeiro cujo `media` bate, então as versões mobile vêm
              primeiro.
            */}
            <source src="/hero/banner-hero-mobile.webm" type="video/webm" media="(max-width: 768px)" />
            <source src="/hero/banner-hero-mobile.mp4" type="video/mp4" media="(max-width: 768px)" />
            <source src="/hero/banner-hero.webm" type="video/webm" />
            <source src="/hero/banner-hero.mp4" type="video/mp4" />
          </video>
          {/*
            Scrim gradiente (mais escuro no centro/base, onde fica o texto;
            quase transparente nas bordas) — garante contraste em qualquer
            frame do vídeo sem esconder o vídeo inteiro atrás de um véu chapado.
          */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 65%, rgba(34,27,25,0.55) 0%, rgba(34,27,25,0.25) 45%, rgba(34,27,25,0.05) 75%)",
            }}
            aria-hidden="true"
          />
        </div>

        <HeroScene progressRef={progressRef} />

        {/*
          Caligrafia de entrada — só existe no primeiro momento (progress
          perto de 0) e some assim que a rolagem começa. `opacity` via
          `clamp()` lendo `--hero-progress` direto no CSS: acompanha o dedo
          no scroll 1:1, sem esperar um re-render do React. `pointer-events:
          none` porque é só assinatura decorativa — nunca deve capturar
          clique, nem depois de sumir.

          Layout diferente por tamanho de tela, não um `flex-wrap` que
          quebra sozinho: no mobile (padrão, sem prefixo) é
          `flex-col items-start` — "Gabriela" e "Emanuel" alinhados à
          esquerda, com o "&" (menor, `self-center`) centralizado
          horizontalmente entre os dois, tipo uma assinatura. A partir de
          `sm:` vira `flex-row items-center justify-center` — os 3 numa
          linha só, centralizados, "Gabriela & Emanuel" corrido (o texto
          original).

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
          className="pointer-events-none absolute inset-0 z-20 flex flex-col items-start justify-center gap-1 px-6 text-left font-script leading-none text-white sm:flex-row sm:items-center sm:justify-center sm:gap-10 sm:text-center"
          style={{
            fontSize: "clamp(3.5rem, 12vw, 8rem)",
            textShadow: "0 2px 24px rgba(34,27,25,0.35)",
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
    </div>
  );
}
