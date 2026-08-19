"use client";

import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import type { Points as ThreePoints } from "three";
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
 *    geometria simples, `dpr` limitado, sem sombra/pós-processamento.
 *  - Não implementa `prefers-reduced-motion` — exceção de acessibilidade
 *    dispensada explicitamente pelo casal nesta v1 (decisão de produto, não
 *    do agente; ver docs/design-system/acessibilidade.md).
 */

const PARTICLE_COUNT = 160;

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

function FloatingParticles() {
  const pointsRef = useRef<ThreePoints>(null);

  const positions = useMemo(() => {
    const array = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      array[i * 3] = (Math.random() - 0.5) * 12;
      array[i * 3 + 1] = (Math.random() - 0.5) * 7;
      array[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return array;
  }, []);

  useFrame((_state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.035;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.07}
        color={designTokens.color.gold500}
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
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

export function HeroScene() {
  const [status, setStatus] = useState<"checking" | "webgl" | "fallback">("checking");

  useEffect(() => {
    setStatus(supportsWebGL() ? "webgl" : "fallback");
  }, []);

  if (status !== "webgl") {
    return <DecorativeFallback />;
  }

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      <WebglErrorBoundary onFailure={() => setStatus("fallback")}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: false, alpha: true }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <ambientLight intensity={0.6} />
          <FloatingParticles />
        </Canvas>
      </WebglErrorBoundary>
    </div>
  );
}
