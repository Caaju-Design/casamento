"use client";

import { Component, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Points as ThreePoints, Group as ThreeGroup, Mesh as ThreeMesh, Sprite as ThreeSprite } from "three";
import { designTokens } from "@/lib/design-system/tokens";

/**
 * Cena decorativa em three.js para o hero da home — puramente estética, sem
 * papel funcional (ver docs/architecture/adr/ e docs/design-system/acessibilidade.md).
 *
 * Requisitos deste projeto para este componente:
 *  - Fallback obrigatório se não houver suporte a WebGL: nunca tela em
 *    branco ou quebrada — aqui, um gradiente estático com o mesmo clima
 *    visual assume o lugar da cena 3D.
 *  - Orçamento de performance para celular mais fraco: poucas partículas,
 *    geometria simples, `dpr` limitado, sem sombra/pós-processamento (o
 *    "raio de sol" abaixo é feito com planos + sprite de textura gerada em
 *    canvas 2D, sem shader customizado nem post-processing).
 *  - Não implementa `prefers-reduced-motion` — exceção de acessibilidade
 *    dispensada explicitamente pelo casal nesta v1 (decisão de produto, não
 *    do agente; ver docs/design-system/acessibilidade.md).
 *
 * Progresso de rolagem (`progressRef`): a cena roda o tempo todo, contínua
 * e independente de onde a página está rolada (gravidade e vento das
 * pétalas nunca param) — só a *intensidade visual* reage ao scroll: no
 * topo (progress 0) é o auge, com o máximo de pétalas e o raio de sol
 * cheio; assim que a rolagem começa, o raio de sol vai sumindo e a
 * quantidade de pétalas visíveis vai diminuindo aos poucos, pra cena não
 * brigar com o conteúdo que aparece por cima dela.
 */

const PARTICLE_COUNT = 180;

// Pétalas de glicínia enviadas pelo casal (fotos recortadas, já com canal
// alpha — não são as fotos de banco de imagem com marca d'água usadas só
// como referência visual antes; essas aqui foram preparadas pelo casal
// especificamente pra virar sprite) — 3 variações, divididas em partes
// iguais do total de partículas pra dar variedade sem repetir sempre a
// mesma pétala.
const PETAL_TEXTURE_URLS = ["/hero/petals/petal-1.png", "/hero/petals/petal-2.png", "/hero/petals/petal-3.png"];

// A partir de quanto do progresso de rolagem (0 a 1) o raio de sol já
// sumiu por completo. Baixado de 0.28 pra 0.02 — pedido explícito de novo
// pra sumir ainda mais cedo (era 5% antes, agora 2%). O fade em si usa uma
// curva "ease-out" cúbica (ver `SunRays` abaixo, `Math.pow(1 - t, 3)`), não
// `smoothstep`: dispara mais rápido logo que a rolagem começa (é aí que o
// brilho precisa começar a sumir "de verdade", não só de leve) e só
// desacelera perto do fim — o oposto de um corte seco, mas também sem
// demorar pra sair de cena.
const SUN_RAY_FADE_END = 0.02;
// A partir de quanto do progresso a quantidade de pétalas já chegou no
// mínimo (nunca some 100% — a cena continua viva o resto da rolagem).
const PETAL_THINNING_END = 0.6;
const PETAL_MIN_VISIBLE_RATIO = 0.15;

/** `t*t*(3-2t)` — easing suave (sem começo/fim abruptos) pra qualquer transição 0→1 desta cena. */
function smoothstep(t: number): number {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped * clamped * (3 - 2 * clamped);
}

function supportsWebGL(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return Boolean(window.WebGLRenderingContext && context);
  } catch {
    return false;
  }
}

/**
 * Gera em canvas 2D (sem depender de nenhum asset externo) uma textura de
 * brilho radial suave, usada no núcleo do sol.
 *
 * Gradiente com um "platô" largo de alta opacidade (até 55% do raio, não
 * só o centro) em vez de cair suave desde o centro — sem isso, ao
 * multiplicar a opacidade inteira do sprite por um fator (o fade do
 * scroll), as bordas já fracas do gradiente ficam invisíveis primeiro,
 * dando a impressão de o CÍRCULO ENCOLHENDO em vez de simplesmente
 * clarear/apagar por igual (foi exatamente o "esmaecendo tipo fadeout...
 * não diminuindo o tamanho" pedido) — com o platô, a maior parte do disco
 * dima junto, só a franja externa (já fina) que reage antes.
 */
function makeGlowTexture(): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,248,224,1)");
    gradient.addColorStop(0.55, "rgba(255,238,200,0.85)");
    gradient.addColorStop(0.8, "rgba(255,226,158,0.35)");
    gradient.addColorStop(1, "rgba(255,226,158,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Gera em canvas 2D um feixe de luz — claro na "fonte" (topo) e sumindo
 * gradualmente até o fim do comprimento, com as bordas laterais também
 * esmaecidas (senão o plano retangular aparece com corte reto nos lados,
 * lendo como um "raio quadrado" em vez de luz).
 *
 * Duas passadas: 1) gradiente vertical define o brilho ao longo do
 * comprimento; 2) `destination-in` usa um gradiente radial horizontal como
 * máscara de alpha, arredondando as bordas esquerda/direita.
 */
function makeBeamTexture(): THREE.Texture {
  const w = 128;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const vertical = ctx.createLinearGradient(0, 0, 0, h);
    vertical.addColorStop(0, "rgba(255,241,214,0.95)");
    vertical.addColorStop(0.45, "rgba(255,224,150,0.45)");
    vertical.addColorStop(1, "rgba(255,224,150,0)");
    ctx.fillStyle = vertical;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = "destination-in";
    const horizontalMask = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, w * 0.62);
    horizontalMask.addColorStop(0, "rgba(0,0,0,1)");
    horizontalMask.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = horizontalMask;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Quanto de desfoque (em px, na escala original da imagem — 256px) aplicar
// em cada foto de pétala antes de virar textura. Baixado de 3.5 pra 2.2:
// mesmo com o bug de textura (NPOT/mipmap) corrigido, as pétalas relatadas
// como "sumidas" de novo provavelmente é isso — desfocadas demais e
// pequenas, elas se perdem visualmente dentro do próprio vídeo de fundo
// (que já tem glicínias e bokeh desfocados), fica difícil de notar mesmo
// estando lá. Menos desfoque + mais brilho/saturação (ver
// `loadBlurredTexture`) + partícula maior dão mais presença sem virar
// sticker nítido colado por cima.
const PETAL_BLUR_PX = 2.2;

/**
 * Carrega uma imagem e devolve uma `THREE.Texture` já desfocada — em vez de
 * post-processing (proibido pelo orçamento de performance deste componente,
 * ver topo do arquivo) ou um shader customizado, o desfoque é aplicado UMA
 * VEZ em canvas 2D (`ctx.filter = "blur(...)"`), antes de subir pra GPU, do
 * mesmo jeito que `makeGlowTexture`/`makeBeamTexture` já geram as texturas
 * do raio de sol em canvas — só que aqui carregando uma foto em vez de
 * desenhar uma forma. Sem isso as pétalas (nítidas, recortadas) destoavam
 * do resto da cena, que já tem desfoque em várias camadas (o próprio vídeo
 * do hero tem glicínias desfocadas ao fundo) — o desfoque aqui é o que dá
 * a sensação de profundidade e faz as pétalas lerem como parte do mesmo
 * ambiente, não como stickers colados por cima.
 *
 * Carregamento é assíncrono (`Image.onload`); a textura já existe desde o
 * início (canvas em branco) e é atualizada (`needsUpdate`) quando a imagem
 * termina de carregar — o `<points>` já pode montar sem esperar.
 */
function loadBlurredTexture(url: string, blurPx: number): THREE.Texture {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const image = new Image();
  image.onload = () => {
    // Canvas um pouco maior que a imagem original: o `blur()` do canvas
    // espalha os pixels da borda pra fora do próprio desenho — sem essa
    // margem extra, o desfoque ficaria cortado seco nas bordas do canvas,
    // lendo como um degrau em vez de um esmaecimento suave.
    const margin = blurPx * 4;
    canvas.width = image.width + margin * 2;
    canvas.height = image.height + margin * 2;
    if (ctx) {
      // `brightness`/`saturate` além do `blur`: as fotos originais, depois
      // de desfocadas e reduzidas a pontos pequenos na cena, ficavam
      // esmaecidas demais pra se destacar contra um vídeo de fundo já
      // cheio de cor — um empurrão de brilho/saturação aqui compensa isso
      // sem precisar aumentar opacidade (que já estava no máximo).
      ctx.filter = `blur(${blurPx}px) brightness(1.25) saturate(1.35)`;
      ctx.drawImage(image, margin, margin);
    }
    texture.needsUpdate = true;
  };
  image.src = url;

  // BUG real encontrado nesta revisão: o canvas dessa textura nunca tem
  // dimensão potência de 2 (a foto original + a margem do blur somam um
  // tamanho arbitrário, tipo 284×284) — sem isso, o filtro de minificação
  // padrão do three.js (`LinearMipmapLinearFilter`) exige mipmaps, que só
  // funcionam garantidamente em textura POT. Em contexto WebGL1 (comum em
  // celular/navegador mais antigo — o WebGL2 tolera NPOT, mas nem todo
  // aparelho/navegador roda WebGL2), isso faz a textura falhar
  // silenciosamente: sem erro no console, ela simplesmente não aparece —
  // bate exatamente com "as pétalas sumiram". Desligar mipmap e usar
  // filtro linear simples resolve pra qualquer tamanho de canvas.
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return texture;
}

/**
 * Um grupo de pétalas caindo com física simples: gravidade (queda constante
 * por partícula) + vento (deriva lateral senoidal, com fase própria por
 * partícula pra não caírem todas em sincronia) + reciclagem (quando sai da
 * cena por baixo, volta pro topo com posição nova) — looping contínuo,
 * nunca para, independente da rolagem.
 *
 * Recebe `textureUrl` porque a cena inteira usa 3 grupos em paralelo, um
 * pra cada foto de pétala de glicínia que o casal mandou (ver
 * `PETAL_TEXTURE_URLS`) — `THREE.Points` desenha todos os pontos de um
 * mesmo objeto com a MESMA textura num único draw call, então pra ter as 3
 * variações ao mesmo tempo (em vez de repetir sempre a mesma pétala) a
 * saída é ter 3 objetos `<points>` separados, cada um com sua textura e uma
 * fração do total de partículas — mais barato pra GPU do que trocar pra
 * `InstancedMesh` só por causa disso.
 *
 * A quantidade *visível* de pétalas (não a física, que roda igual o tempo
 * todo — o custo de simular esses pontos é desprezível) diminui conforme o
 * scroll avança, via `geometry.setDrawRange`: corta quantos vértices do
 * buffer são desenhados sem recriar geometria a cada frame.
 */
function FallingPetals({
  progressRef,
  textureUrl,
  count,
}: {
  progressRef: RefObject<number>;
  textureUrl: string;
  count: number;
}) {
  const pointsRef = useRef<ThreePoints>(null);
  const petalTexture = useMemo(() => loadBlurredTexture(textureUrl, PETAL_BLUR_PX), [textureUrl]);

  useEffect(() => () => petalTexture.dispose(), [petalTexture]);

  const { positions, fallSpeed, swayPhase, swaySpeed } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const fallSpeed = new Float32Array(count);
    const swayPhase = new Float32Array(count);
    const swaySpeed = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = Math.random() * 10 - 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      // Queda bem mais lenta que a v1 (0.35–0.8 lia como "chuva") — pétala
      // de glicínia paira, não despenca.
      fallSpeed[i] = 0.08 + Math.random() * 0.14;
      swayPhase[i] = Math.random() * Math.PI * 2;
      swaySpeed[i] = 0.25 + Math.random() * 0.5;
    }
    return { positions, fallSpeed, swayPhase, swaySpeed };
  }, [count]);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const progress = progressRef.current ?? 0;

    // Reduz aos poucos a quantidade de pétalas desenhadas conforme a
    // rolagem avança (nunca chega a zero — mantém a cena viva). `smoothstep`
    // (mesma easing do raio de sol, ver `SUN_RAY_FADE_END`) em vez de reta
    // linear, pra não ligar/desligar pétalas num ritmo mecânico.
    const thinning = smoothstep(progress / PETAL_THINNING_END);
    const visibleRatio = 1 - thinning * (1 - PETAL_MIN_VISIBLE_RATIO);
    points.geometry.setDrawRange(0, Math.max(2, Math.round(count * visibleRatio)));

    // `tsconfig.json` liga `noUncheckedIndexedAccess` — todo acesso por
    // índice (array[i], attributes.position) volta tipado como "| undefined"
    // pro TypeScript, mesmo quando a gente sabe (pelo laço `i < count`,
    // sempre dentro do tamanho dos buffers) que nunca é. Guard explícito +
    // `?? 0` de fallback deixam isso são pro compilador sem mudar o
    // comportamento em runtime.
    const positionAttribute = points.geometry.attributes.position;
    if (!positionAttribute) return;
    const array = positionAttribute.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < count; i += 1) {
      const idx = i * 3;
      const fall = fallSpeed[i] ?? 0;
      const phase = swayPhase[i] ?? 0;
      const sway = swaySpeed[i] ?? 0;

      // Gravidade — cada pétala cai numa velocidade própria.
      const nextY = (array[idx + 1] ?? 0) - fall * delta;
      // Vento — deriva lateral senoidal, própria de cada pétala (não sincronizada).
      const nextX = (array[idx] ?? 0) + Math.sin(time * sway + phase) * 0.15 * delta;
      const nextZ = (array[idx + 2] ?? 0) + Math.cos(time * sway * 0.7 + phase) * 0.1 * delta;

      // Reciclagem: quando sai da cena por baixo, volta pro topo.
      if (nextY < -4.5) {
        array[idx + 1] = 4.5 + Math.random() * 2;
        array[idx] = (Math.random() - 0.5) * 12;
        array[idx + 2] = (Math.random() - 0.5) * 6;
      } else {
        array[idx + 1] = nextY;
        array[idx] = nextX;
        array[idx + 2] = nextZ;
      }
    }
    positionAttribute.needsUpdate = true;

    points.rotation.y += delta * 0.008;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      {/*
        Sem `color` aqui de propósito: é uma foto de verdade (não mais um
        gradiente gerado em canvas), então tingir por cima com um token de
        cor deixaria tudo com a mesma tonalidade lilás plana — a variação
        natural de cor de cada foto é que dá o efeito de pétala de verdade.
      */}
      <pointsMaterial
        map={petalTexture}
        size={0.34}
        transparent
        opacity={1}
        sizeAttenuation
        depthWrite={false}
        alphaTest={0.01}
      />
    </points>
  );
}

interface SunBeamSpec {
  angle: number;
  baseOpacity: number;
}

const SUN_BEAMS: SunBeamSpec[] = [-0.55, -0.3, -0.05, 0.2, 0.45].map((angle) => ({
  angle,
  baseOpacity: 0.5 - Math.abs(angle) * 0.35,
}));

/**
 * "Raio de sol" sem post-processing: um sprite de brilho no núcleo +
 * alguns planos alongados (texturas geradas em canvas 2D) em leque,
 * blend aditivo — visualmente lê como luz, custa perto de nada pra GPU.
 * Posicionado no canto superior-esquerdo pra ecoar o sol que já aparece
 * no próprio vídeo do hero por trás.
 */
function SunRays({ progressRef }: { progressRef: RefObject<number> }) {
  const groupRef = useRef<ThreeGroup>(null);
  const glowRef = useRef<ThreeSprite>(null);
  const beamRefs = useRef<Array<ThreeMesh | null>>([]);

  const glowTexture = useMemo(() => makeGlowTexture(), []);
  const beamTexture = useMemo(() => makeBeamTexture(), []);

  useEffect(
    () => () => {
      glowTexture.dispose();
      beamTexture.dispose();
    },
    [glowTexture, beamTexture],
  );

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) return;

    const progress = progressRef.current ?? 0;
    // Ease-out cúbico (`(1-t)³`) em vez de `smoothstep`: a velocidade de
    // queda é máxima logo no início (t=0) e vai desacelerando até o fim —
    // ao contrário do `smoothstep` (que começa devagar), aqui o brilho já
    // cai visivelmente nos primeiros % de rolagem, e só nos últimos % que
    // a queda desacelera pra não cortar seco em zero. Resolve os dois
    // pedidos juntos: sumir mais cedo (`SUN_RAY_FADE_END` menor) E ter uma
    // sensação de "ease out" de verdade, não uma curva simétrica.
    const fadeT = Math.min(1, Math.max(0, progress / SUN_RAY_FADE_END));
    const visibility = Math.pow(1 - fadeT, 3);
    group.visible = visibility > 0.01;
    if (!group.visible) return;

    // Cintilação — o sol "vivo", não uma imagem estática. Roda sempre,
    // inclusive parado no topo (progress 0), que é quando mais dá pra
    // reparar nela — combina duas frequências pra não parecer um "pisca"
    // mecânico e uniforme. Amplitude bem maior que a rodada anterior
    // (ainda lida como "oscila pouco" no feedback) — agora varia de ~30%
    // a 100% do brilho, com a frequência principal também mais rápida.
    const flicker =
      0.65 + Math.sin(state.clock.elapsedTime * 1.1) * 0.25 + Math.sin(state.clock.elapsedTime * 3.2) * 0.1;

    if (glowRef.current) {
      const glowMaterial = glowRef.current.material as unknown as THREE.SpriteMaterial;
      glowMaterial.opacity = visibility * flicker * 0.9;
    }

    beamRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const beam = SUN_BEAMS[i];
      if (!beam) return;
      const material = mesh.material as unknown as THREE.MeshBasicMaterial;
      material.opacity = visibility * flicker * beam.baseOpacity;
    });
  });

  return (
    <group ref={groupRef} position={[-2.8, 2.5, -2]}>
      <sprite ref={glowRef} scale={[3.4, 3.4, 1]}>
        <spriteMaterial
          map={glowTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.9}
        />
      </sprite>
      {SUN_BEAMS.map((beam, i) => (
        <mesh
          key={beam.angle}
          ref={(el) => {
            beamRefs.current[i] = el;
          }}
          rotation={[0, 0, beam.angle]}
        >
          <planeGeometry args={[1.5, 6.5]} />
          <meshBasicMaterial
            map={beamTexture}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={beam.baseOpacity}
          />
        </mesh>
      ))}
    </group>
  );
}

interface WebglErrorBoundaryProps {
  children: ReactNode;
  onFailure: () => void;
}

/**
 * Última linha de defesa: se o WebGL falhar em tempo de execução (ex.:
 * driver/GPU instável, contexto perdido), captura o erro de render da cena
 * e aciona o fallback estático em vez de deixar a página quebrada.
 */
interface WebglErrorBoundaryState {
  hasError: boolean;
}

class WebglErrorBoundary extends Component<WebglErrorBoundaryProps, WebglErrorBoundaryState> {
  state: WebglErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): WebglErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onFailure();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function DecorativeFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10"
      style={{
        background: `radial-gradient(circle at 30% 20%, ${designTokens.color.gold300} 0%, transparent 45%), radial-gradient(circle at 75% 60%, ${designTokens.color.blush300} 0%, transparent 55%), ${designTokens.color.cream50}`,
      }}
    />
  );
}

export interface HeroSceneProps {
  /**
   * Ref mutável (sem re-render) com o progresso de rolagem do hero, 0 a 1
   * — a mesma fonte de verdade que HeroSection usa pra `--hero-progress` e
   * pro `currentTime` do vídeo (ver components/organisms/HeroSection.tsx).
   * Opcional: sem ela, a cena roda no "auge" (raio de sol cheio, pétalas
   * no máximo) o tempo todo — comportamento razoável se este componente
   * for usado fora do hero algum dia.
   */
  progressRef?: RefObject<number>;
}

export function HeroScene({ progressRef }: HeroSceneProps) {
  const [status, setStatus] = useState<"checking" | "webgl" | "fallback">("checking");
  const [isPageVisible, setIsPageVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackProgressRef = useRef(0);
  const resolvedProgressRef = progressRef ?? fallbackProgressRef;

  useEffect(() => {
    setStatus(supportsWebGL() ? "webgl" : "fallback");
  }, []);

  // BUG real encontrado nesta revisão (era a causa do "as pétalas sumiram" e
  // "o raio de sol não faz nada" que se repetiu em duas rodadas de correção
  // que só mexiam na aparência, não no loop de render): a versão anterior
  // pausava `frameloop` (`"never"`) com base num `IntersectionObserver`
  // observando se o hero "estava perto da viewport". Só que esse elemento
  // observado vive dentro de uma `<section>` `position: sticky` dentro de
  // um trilho de `300vh` (ver HeroSection.tsx) — testado ao vivo (Chrome,
  // via automação), o PRIMEIRO callback do observer, nessa combinação de
  // `sticky` + trilho gigante, disparava com `isIntersecting: false` mesmo
  // com o hero ocupando a tela inteira, e como nada mais reavalia isso
  // enquanto o usuário não rola pra FORA do hero (ele fica pinado ali o
  // tempo todo), o `frameloop` ficava travado em `"never"` pra sempre —
  // literalmente nenhum frame desenhado, daí pétalas e raio de sol
  // simplesmente não apareciam nunca, em qualquer rolagem dentro do hero.
  //
  // Troca por `document.visibilitychange` (Page Visibility API nativa do
  // navegador, sem depender de geometria/layout de elemento nenhum): só
  // pausa quando a ABA inteira fica em segundo plano de verdade (troca de
  // app, minimizado) — continua economizando bateria depois que o casal sai
  // do site, sem o risco de "achar" que o hero não está visível estando ele
  // ocupando a tela inteira.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const handleVisibilityChange = () => setIsPageVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleVisibilityChange();
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (status !== "webgl") {
    return <DecorativeFallback />;
  }

  return (
    <div ref={containerRef} aria-hidden="true" className="absolute inset-0 -z-10">
      <WebglErrorBoundary onFailure={() => setStatus("fallback")}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: false, alpha: true }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          frameloop={isPageVisible ? "always" : "never"}
        >
          <ambientLight intensity={0.6} />
          <SunRays progressRef={resolvedProgressRef} />
          {PETAL_TEXTURE_URLS.map((url) => (
            <FallingPetals
              key={url}
              progressRef={resolvedProgressRef}
              textureUrl={url}
              count={Math.round(PARTICLE_COUNT / PETAL_TEXTURE_URLS.length)}
            />
          ))}
        </Canvas>
      </WebglErrorBoundary>
    </div>
  );
}
