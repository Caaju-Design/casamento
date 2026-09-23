"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Points as ThreePoints } from "three";

/**
 * Folhas de bordo em aquarela caindo por cima do hero (substituem as pétalas
 * lilás de glicínia, que não combinavam com a árvore vermelha do BANNERHERO).
 *
 * Cada folha é um ponto com shader próprio:
 *  - arte: atlas 2×2 de folhas pintadas em aquarela
 *    (`public/hero/leaves/maple-atlas.png`, gerado por
 *    `scripts/generate-maple-leaves.py`);
 *  - gira e "vira" no ar (achata na horizontal quando está de lado, e o verso
 *    fica mais claro);
 *  - NASCE PINTADA: quando aparece, a tinta entra do miolo pra fora com uma
 *    borda molhada mais escura, como uma pincelada caindo no papel, e só
 *    depois a folha começa a cair. Quando sai por baixo da tela, renasce
 *    pintando em outro ponto visível.
 *  - some com a rolagem (mesma janela de antes: `LEAF_FADE_END`).
 */

const LEAF_COUNT = 56;
const ATLAS_URL = "/hero/leaves/maple-atlas.png";
const NOISE_URL = "/hero/aquarela/noise.png";
/** Tamanho da folha no mundo (a câmera fica em z=6, fov 50). */
const LEAF_SIZE = 0.7;
/** Tempo da pincelada que "pinta" a folha quando ela nasce (segundos). */
const PAINT_SECONDS = 1.3;
/** Folha fica parada enquanto é pintada, depois solta. */
const HOLD_SECONDS = 0.5;
/** Progresso de rolagem em que as folhas terminaram de sumir. */
const LEAF_FADE_END = 0.12;

const VERT = /* glsl */ `
  attribute vec4 aSeed;    // x: célula do atlas (0-3), y: vel. giro, z: vel. virar, w: fase
  attribute float aBorn;   // instante em que a folha nasceu (pra pincelada)
  uniform float uTime; uniform float uPx; uniform float uSize;
  varying vec4 vSeed; varying float vAge; varying float vAngle; varying float vFlip;
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(uSize * uPx / -mv.z, 2.0, 256.0);
    vSeed = aSeed;
    vAge = uTime - aBorn;
    // só começa a girar depois de pintada
    float live = max(vAge - ${(PAINT_SECONDS + HOLD_SECONDS).toFixed(2)}, 0.0);
    vAngle = aSeed.w * 6.2831 + live * (aSeed.y - 0.5) * 1.6;
    vFlip = cos(aSeed.w * 3.0 + live * aSeed.z * 1.4);
  }`;

const FRAG = /* glsl */ `
  uniform sampler2D tAtlas; uniform sampler2D tNoise; uniform float uOpacity;
  varying vec4 vSeed; varying float vAge; varying float vAngle; varying float vFlip;
  void main(){
    vec2 p = gl_PointCoord - 0.5;
    p.y = -p.y;
    float c = cos(vAngle), s = sin(vAngle);
    p = mat2(c, -s, s, c) * p;
    float f = max(abs(vFlip), 0.12);
    p.x /= f;                                   // folha de lado fica fininha
    if (abs(p.x) > 0.5 || abs(p.y) > 0.5) discard;
    vec2 uv = p + 0.5;
    float cell = floor(vSeed.x * 3.999);
    vec2 cuv = (uv + vec2(mod(cell, 2.0), 1.0 - floor(cell / 2.0))) * 0.5;
    vec4 leaf = texture2D(tAtlas, cuv);
    if (leaf.a < 0.02) discard;

    // pincelada: a tinta entra do miolo pra fora, com borda irregular
    float n = texture2D(tNoise, uv * 0.9 + vSeed.w * 7.0).r;
    float order = length(uv - vec2(0.5, 0.45)) * 1.25 + (n - 0.5) * 0.55;
    float t = clamp(vAge / ${PAINT_SECONDS.toFixed(2)}, 0.0, 1.0);
    float front = t * 1.25 - 0.05;
    float painted = smoothstep(order - 0.06, order, front); // 1 onde a frente já passou
    if (painted < 0.01) discard;
    // borda molhada: logo atrás da frente a tinta fica mais escura e densa
    float wet = smoothstep(front - 0.16, front - 0.02, order) * painted * (1.0 - t * 0.6);
    vec3 col = mix(leaf.rgb, leaf.rgb * leaf.rgb * 0.95, wet * 0.8);
    // verso da folha: mais claro/lavado
    col = mix(col, mix(col, vec3(1.0, 0.96, 0.9), 0.35), step(vFlip, 0.0));
    float a = leaf.a * painted * (0.85 + 0.15 * wet) * uOpacity;
    gl_FragColor = vec4(col, a);
  }`;

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export function FallingMapleLeaves({ progressRef, count = LEAF_COUNT }: { progressRef: RefObject<number>; count?: number }) {
  const pointsRef = useRef<ThreePoints>(null);
  const { size, gl, camera } = useThree();

  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const atlas = loader.load(ATLAS_URL);
    atlas.colorSpace = THREE.NoColorSpace;
    const noise = loader.load(NOISE_URL);
    noise.wrapS = noise.wrapT = THREE.RepeatWrapping;
    noise.colorSpace = THREE.NoColorSpace;
    return { atlas, noise };
  }, []);
  useEffect(() => () => {
    textures.atlas.dispose();
    textures.noise.dispose();
  }, [textures]);

  // Área visível no plano z=0 (câmera em z=6, fov 50): meia-altura ≈ 2.8.
  const spawn = useMemo(() => {
    const persp = camera as THREE.PerspectiveCamera;
    const halfH = Math.tan(THREE.MathUtils.degToRad((persp.fov ?? 50) / 2)) * 6;
    const halfW = halfH * (size.width / Math.max(1, size.height));
    return { halfH, halfW };
  }, [camera, size.width, size.height]);

  const { positions, seeds, born, fall } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 4);
    const born = new Float32Array(count);
    const fall = new Float32Array(count);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 2 * 4.5;
      positions[i * 3 + 1] = (Math.random() - 0.3) * 2 * 2.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      seeds.set([Math.random(), Math.random(), 0.4 + Math.random() * 0.8, Math.random()], i * 4);
      // ao abrir a página as folhas vão sendo pintadas uma a uma
      born[i] = Math.random() * 3.5;
      fall[i] = 0.12 + Math.random() * 0.18;
    }
    return { positions, seeds, born, fall };
  }, [count]);

  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      tAtlas: { value: textures.atlas },
      tNoise: { value: textures.noise },
      uTime: { value: 0 },
      uPx: { value: 800 },
      uSize: { value: LEAF_SIZE },
      uOpacity: { value: 1 },
    }),
    [textures],
  );

  useFrame((state, delta) => {
    const points = pointsRef.current;
    const mat = materialRef.current;
    if (!mat) return;
    const u = mat.uniforms;
    const pos = points?.geometry.attributes.position;
    const bornAttr = points?.geometry.attributes.aBorn;
    if (!points || !pos || !bornAttr || !u.uTime || !u.uPx || !u.uOpacity) return;

    const time = state.clock.elapsedTime;
    u.uTime.value = time;
    // pixels por unidade de mundo a 1 unidade de distância
    const persp = state.camera as THREE.PerspectiveCamera;
    u.uPx.value = (size.height * gl.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(persp.fov / 2)));

    const thinning = smoothstep((progressRef.current ?? 0) / LEAF_FADE_END);
    u.uOpacity.value = 1 - thinning;
    points.visible = thinning < 0.999;

    const arr = pos.array as Float32Array;
    const bornArr = bornAttr.array as Float32Array;
    let reborn = false;
    for (let i = 0; i < count; i += 1) {
      const age = time - (bornArr[i] ?? 0);
      if (age < PAINT_SECONDS + HOLD_SECONDS) continue; // ainda sendo pintada
      const idx = i * 3;
      const w = seeds[i * 4 + 3] ?? 0;
      const y = (arr[idx + 1] ?? 0) - (fall[i] ?? 0.15) * delta;
      if (y < -spawn.halfH - 0.8) {
        // renasce pintando num ponto visível (parte de cima da tela)
        arr[idx] = (Math.random() - 0.5) * 2 * spawn.halfW * 0.9;
        arr[idx + 1] = spawn.halfH * (0.1 + Math.random() * 0.75);
        arr[idx + 2] = (Math.random() - 0.5) * 4;
        bornArr[i] = time;
        reborn = true;
      } else {
        arr[idx + 1] = y;
        arr[idx] = (arr[idx] ?? 0) + Math.sin(time * 0.6 + w * 20) * 0.22 * delta;
        arr[idx + 2] = (arr[idx + 2] ?? 0) + Math.cos(time * 0.4 + w * 13) * 0.08 * delta;
      }
    }
    pos.needsUpdate = true;
    if (reborn) bornAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 4]} />
        <bufferAttribute attach="attributes-aBorn" args={[born, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
      />
    </points>
  );
}
