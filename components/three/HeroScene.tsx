"use client";

import { Component, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Points as ThreePoints, Group as ThreeGroup, Mesh as ThreeMesh } from "three";
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

// A partir de quanto do progresso de rolagem (0 a 1) o raio de sol já
// sumiu por completo.
const SUN_RAY_FADE_END = 0.35;
// A partir de quanto do progresso a quantidade de pétalas já chegou no
// mínimo (nunca some 100% — a cena continua viva o resto da rolagem).
const PETAL_THINNING_END = 0.6;
const PETAL_MIN_VISIBLE_RATIO = 0.15;

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

/** Gera em canvas 2D (sem depender de nenhum asset externo) uma textura de brilho radial suave, usada no núcleo do sol. */
function makeGlowTexture(): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,248,224,1)");
    gradient.addColorStop(0.35, "rgba(255,226,158,0.55)");
    gradient.addColorStop(1, "rgba(255,226,158,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/** Gera em canvas 2D um feixe de luz (elipse alongada, clara na "fonte" e sumindo nas bordas) — cada raio do sol é um plano com essa textura. */
function makeBeamTexture(): THREE.Texture {
  const w = 128;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(w / 2, h * 0.08, 0, w / 2, h * 0.08, h * 0.78);
    gradient.addColorStop(0, "rgba(255,241,214,0.9)");
    gradient.addColorStop(0.35, "rgba(255,224,150,0.4)");
    gradient.addColorStop(1, "rgba(255,224,150,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Pétalas caindo com física simples: gravidade (queda constante por
 * partícula) + vento (deriva lateral senoidal, com fase própria por
 * partícula pra não caírem todas em sincronia) + reciclagem (quando sai da
 * cena por baixo, volta pro topo com posição nova) — looping contínuo,
 * nunca para, independente da rolagem.
 *
 * A quantidade *visível* de pétalas (não a física, que roda igual pras 180
 * o tempo todo — o custo de simular 180 pontos é desprezível) diminui
 * conforme o scroll avança, via `geometry.setDrawRange`: corta quantos
 * vértices do buffer são desenhados sem recriar geometria a cada frame.
 */
function FallingPetals({ progressRef }: { progressRef: RefObject<number> }) {
  const pointsRef = useRef<ThreePoints>(null);

  const { positions, fallSpeed, swayPhase, swaySpeed } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const fallSpeed = new Float32Array(PARTICLE_COUNT);
    const swayPhase = new Float32Array(PARTICLE_COUNT);
    const swaySpeed = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = Math.random() * 10 - 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      fallSpeed[i] = 0.35 + Math.random() * 0.45;
      swayPhase[i] = Math.random() * Math.PI * 2;
      swaySpeed[i] = 0.25 + Math.random() * 0.5;
    }
    return { positions, fallSpeed, swayPhase, swaySpeed };
  }, []);

  useFrame((state, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const progress = progressRef.current ?? 0;

    // Reduz aos poucos a quantidade de pétalas desenhadas conforme a
    // rolagem avança (nunca chega a zero — mantém a cena viva).
    const thinning = Math.min(1, progress / PETAL_THINNING_END);
    const visibleRatio = 1 - thinning * (1 - PETAL_MIN_VISIBLE_RATIO);
    points.geometry.setDrawRange(0, Math.max(4, Math.round(PARTICLE_COUNT * visibleRatio)));

    const positionAttribute = points.geometry.attributes.position;
    const array = positionAttribute.array as Float32Array;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const idx = i * 3;

      // Gravidade — cada pétala cai numa velocidade própria.
      array[idx + 1] -= fallSpeed[i] * delta;
      // Vento — deriva lateral senoidal, própria de cada pétala (não sincronizada).
      array[idx] += Math.sin(time * swaySpeed[i] + swayPhase[i]) * 0.15 * delta;
      array[idx + 2] += Math.cos(time * swaySpeed[i] * 0.7 + swayPhase[i]) * 0.1 * delta;

      // Reciclagem: quando sai da cena por baixo, volta pro topo.
      if (array[idx + 1] < -4.5) {
        array[idx + 1] = 4.5 + Math.random() * 2;
        array[idx] = (Math.random() - 0.5) * 12;
        array[idx + 2] = (Math.random() - 0.5) * 6;
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
      <pointsMaterial
        size={0.09}
        color={designTokens.color.blush300}
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
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
    const visibility = Math.max(0, 1 - progress / SUN_RAY_FADE_END);
    group.visible = visibility > 0.01;
    if (!group.visible) return;

    // Leve cintilação — o sol "vivo", não uma imagem estática.
    const flicker = 0.92 + Math.sin(state.clock.elapsedTime * 0.6) * 0.08;

    beamRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const material = mesh.material as unknown as THREE.MeshBasicMaterial;
      material.opacity = visibility * flicker * SUN_BEAMS[i].baseOpacity;
    });
  });

  return (
    <group ref={groupRef} position={[-2.8, 2.5, -2]}>
      <sprite scale={[3.4, 3.4, 1]}>
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
  const [isNearViewport, setIsNearViewport] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackProgressRef = useRef(0);
  const resolvedProgressRef = progressRef ?? fallbackProgressRef;

  useEffect(() => {
    setStatus(supportsWebGL() ? "webgl" : "fallback");
  }, []);

  // Pendência da revisão de performance: o loop de render do R3F (`frameloop`)
  // por padrão nunca para — sem isso, depois que o casal já rolou 3, 4
  // telas pra dentro do site, a GPU continuaria desenhando pétalas e sol
  // fora de tela pro resto da visita, gastando bateria à toa. Aqui a gente
  // observa se o hero ainda está perto da viewport e, se não estiver, pausa
  // o loop (`frameloop="never"`) sem desmontar o Canvas — retoma na hora se
  // o usuário rolar de volta pra cima.
  useEffect(() => {
    // `containerRef` só existe de fato depois que `status` vira "webgl" (é
    // quando a div observada é montada) — por isso `status` entra nas
    // dependências: sem isso, esse efeito rodaria uma vez só no mount,
    // ainda com `containerRef.current` nulo, e nunca reconectaria o
    // observer depois que a div aparecesse.
    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setIsNearViewport(entry.isIntersecting), {
      rootMargin: "200px 0px",
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [status]);

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
          frameloop={isNearViewport ? "always" : "never"}
        >
          <ambientLight intensity={0.6} />
          <SunRays progressRef={resolvedProgressRef} />
          <FallingPetals progressRef={resolvedProgressRef} />
        </Canvas>
      </WebglErrorBoundary>
    </div>
  );
}
