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
 * Gera em canvas 2D as "pontas" espetadas de um brilho de lente de verdade
 * (o efeito "estrela" que sai em todas as direções do núcleo — pedido
 * explícito com fotos de referência de lens flare real, que sempre têm
 * isso além do halo redondo). Um raio central (12 pontas, comprimentos
 * alternados — 4 longas nos eixos, 8 curtas entre elas, igual toda foto de
 * flare de verdade) desenhado com gradientes lineares finos saindo do
 * centro, sem precisar de shader: cada ponta é só uma linha grossa com
 * gradiente de opacidade ao longo do comprimento.
 */
function makeStarburstTexture(): THREE.Texture {
  const size = 512;
  const center = size / 2;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.translate(center, center);
    const spikeCount = 12;
    for (let i = 0; i < spikeCount; i += 1) {
      // Pontas nos eixos (0°, 90°, 180°, 270°) mais longas que as
      // diagonais entre elas — é essa alternância que lê como "estrela"
      // em vez de uma roda de raios uniformes.
      const isAxis = i % 3 === 0;
      const length = isAxis ? center * 0.98 : center * 0.55;
      const width = isAxis ? 3.5 : 1.6;
      const angle = (i / spikeCount) * Math.PI * 2;

      ctx.save();
      ctx.rotate(angle);
      const gradient = ctx.createLinearGradient(0, 0, 0, -length);
      gradient.addColorStop(0, "rgba(255,250,235,0.9)");
      gradient.addColorStop(0.15, "rgba(255,244,210,0.5)");
      gradient.addColorStop(1, "rgba(255,244,210,0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(-width / 2, 0);
      ctx.lineTo(width / 2, 0);
      ctx.lineTo(0, -length);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
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

/**
 * Gera em canvas 2D um anel fino e esmaecido — os "ghosts" circulares
 * concêntricos que aparecem alinhados com o sol em fotos de lens flare de
 * verdade (pedido explícito, com várias fotos de referência mandadas: uma
 * trilha de círculos DIFERENTES — tamanhos e cores variados — saindo do
 * brilho principal, alguns só o contorno/anel, outros disco cheio). Um
 * anel só (não um disco): gradiente radial com um "vale" no meio
 * (transparente) entre duas bordas claras.
 *
 * Em BRANCO neutro de propósito (não mais uma cor fixa embutida no
 * gradiente): cada ghost tinge essa mesma textura com sua própria cor via
 * `spriteMaterial color` (ver `LENS_GHOSTS`/`SunRays` abaixo) — assim dá
 * pra ter vários tons diferentes (laranja, vermelho, verde, roxo — igual
 * às referências) reaproveitando UMA textura só, sem gerar um canvas novo
 * por cor.
 */
function makeRingTexture(): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,0)");
    gradient.addColorStop(0.6, "rgba(255,255,255,0)");
    gradient.addColorStop(0.72, "rgba(255,255,255,0.9)");
    gradient.addColorStop(0.82, "rgba(255,255,255,0.55)");
    gradient.addColorStop(0.92, "rgba(255,255,255,0)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Gera em canvas 2D um disco cheio, macio nas bordas (sem o "vale" do
 * anel) — a outra metade da variedade pedida: nas fotos de referência nem
 * todo ghost é um contorno fino, vários são bolhas cheias e translúcidas.
 * Mesma lógica de tingir via `color` do material que o anel.
 */
function makeDiscTexture(): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255,255,255,0.85)");
    gradient.addColorStop(0.5, "rgba(255,255,255,0.55)");
    gradient.addColorStop(0.85, "rgba(255,255,255,0.18)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
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

interface LensGhostSpec {
  // Posição LOCAL (relativa ao `group` do sol) — os ghosts de lens flare de
  // verdade ficam alinhados ao longo da reta que liga a fonte de luz ao
  // centro da tela (o "eixo óptico"); o grupo do sol fica no canto
  // superior-esquerdo (ver `position={[-2.8, 2.5, -2]}` abaixo), então
  // "andar" em x positivo/y negativo a partir dele é andar em direção ao
  // centro da cena — replicando esse alinhamento sem precisar calcular
  // vetores em runtime.
  position: [number, number, number];
  scale: number;
  baseOpacity: number;
  // "ring" = só o contorno (textura `makeRingTexture`), "disc" = bolha
  // cheia (textura `makeDiscTexture`) — nas fotos de referência mandadas,
  // a trilha de ghosts mistura os dois tipos, não é só anel.
  type: "ring" | "disc";
  // Cada ghost tinge a MESMA textura (anel ou disco, ambas neutras/brancas)
  // com sua própria cor — é isso que dá a variedade "várias circunferências
  // diferentes, cores diferentes" pedida, sem precisar gerar uma textura
  // nova por cor.
  color: string;
}

// Pedido explícito (2 rodadas de fotos de referência de lens flare real):
// uma trilha de ghosts BEM variados — tamanhos bem diferentes entre si
// (não uma progressão suave), tipos misturados (anel/disco) e cores
// variando entre quente (laranja/vermelho, herdando a cor do sol) e fria
// (azul/verde/roxo, que é como prismas de lente de verdade dispersam a
// luz) — trilhando a partir do núcleo em direção ao centro da cena.
const LENS_GHOSTS: LensGhostSpec[] = [
  { position: [0.75, -0.62, 0.15], scale: 0.35, baseOpacity: 0.5, type: "disc", color: "#ffb37a" },
  { position: [1.3, -1.08, 0.3], scale: 1.15, baseOpacity: 0.35, type: "ring", color: "#ff6a4d" },
  { position: [1.85, -1.55, 0.42], scale: 0.5, baseOpacity: 0.45, type: "disc", color: "#8fd8c8" },
  { position: [2.3, -1.9, 0.55], scale: 0.22, baseOpacity: 0.55, type: "disc", color: "#ffe08a" },
  { position: [2.85, -2.35, 0.7], scale: 1.6, baseOpacity: 0.22, type: "ring", color: "#7a8fe0" },
  { position: [3.15, -2.6, 0.8], scale: 0.85, baseOpacity: 0.3, type: "disc", color: "#c98fe0" },
  { position: [3.55, -2.92, 0.9], scale: 0.4, baseOpacity: 0.4, type: "ring", color: "#ff9c6a" },
];

/**
 * "Raio de sol" sem post-processing: sprite de brilho no núcleo + estrela
 * de pontas espetadas (`makeStarburstTexture`) + alguns planos alongados
 * em leque + trilha de ghosts (anéis/discos coloridos) — tudo textura
 * gerada em canvas 2D, blend aditivo, custa perto de nada pra GPU.
 * Posicionado no canto superior-esquerdo pra ecoar o sol que já aparece
 * no próprio vídeo do hero por trás.
 */
function SunRays({ progressRef }: { progressRef: RefObject<number> }) {
  const groupRef = useRef<ThreeGroup>(null);
  const glowRef = useRef<ThreeSprite>(null);
  const starburstRef = useRef<ThreeSprite>(null);
  const beamRefs = useRef<Array<ThreeMesh | null>>([]);
  const ghostRefs = useRef<Array<ThreeSprite | null>>([]);

  const glowTexture = useMemo(() => makeGlowTexture(), []);
  const starburstTexture = useMemo(() => makeStarburstTexture(), []);
  const beamTexture = useMemo(() => makeBeamTexture(), []);
  const ringTexture = useMemo(() => makeRingTexture(), []);
  const discTexture = useMemo(() => makeDiscTexture(), []);

  useEffect(
    () => () => {
      glowTexture.dispose();
      starburstTexture.dispose();
      beamTexture.dispose();
      ringTexture.dispose();
      discTexture.dispose();
    },
    [glowTexture, starburstTexture, beamTexture, ringTexture, discTexture],
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

    if (starburstRef.current) {
      const starMaterial = starburstRef.current.material as unknown as THREE.SpriteMaterial;
      starMaterial.opacity = visibility * flicker;
      // Rotação bem lenta e contínua — um flare de verdade não gira, mas
      // uma leve rotação aqui ajuda a disfarçar que é sempre a MESMA
      // textura estática, sem custar quase nada.
      starburstRef.current.material.rotation = state.clock.elapsedTime * 0.03;
    }

    beamRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const beam = SUN_BEAMS[i];
      if (!beam) return;
      const material = mesh.material as unknown as THREE.MeshBasicMaterial;
      material.opacity = visibility * flicker * beam.baseOpacity;
    });

    // Ghosts cintilam mais discreto que o núcleo — só o essencial pra dar
    // vida, sem competir com a cintilação principal do sol.
    ghostRefs.current.forEach((sprite, i) => {
      if (!sprite) return;
      const ghost = LENS_GHOSTS[i];
      if (!ghost) return;
      const material = sprite.material as unknown as THREE.SpriteMaterial;
      material.opacity = visibility * (0.85 + flicker * 0.15) * ghost.baseOpacity;
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
      <sprite ref={starburstRef} scale={[4.6, 4.6, 1]}>
        <spriteMaterial
          map={starburstTexture}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.85}
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
      {LENS_GHOSTS.map((ghost, i) => (
        <sprite
          key={i}
          ref={(el) => {
            ghostRefs.current[i] = el;
          }}
          position={ghost.position}
          scale={[ghost.scale, ghost.scale, 1]}
        >
          <spriteMaterial
            map={ghost.type === "ring" ? ringTexture : discTexture}
            color={ghost.color}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            opacity={ghost.baseOpacity}
          />
        </sprite>
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
  const containerRef = useRef<HTMLDivElement>(null);
  const fallbackProgressRef = useRef(0);
  const resolvedProgressRef = progressRef ?? fallbackProgressRef;

  useEffect(() => {
    setStatus(supportsWebGL() ? "webgl" : "fallback");
  }, []);

  // HISTÓRICO (pra quem for mexer aqui depois): esta cena já teve duas
  // versões de "pausa inteligente" do `frameloop` do R3F pra economizar
  // bateria quando o hero não estava em uso — primeiro via
  // `IntersectionObserver` (suspeito de travar em `"never"` pra sempre
  // quando combinado com o `position: sticky` do hero, ver histórico do
  // git), depois via `document.visibilitychange`. As duas foram removidas:
  // eu não consegui confirmar com certeza absoluta qual delas (se alguma)
  // era a causa raiz do "pétalas e raio de sol simplesmente não aparecem"
  // relatado repetidas vezes, porque o ambiente onde eu testo essas coisas
  // (navegador automatizado) tem uma limitação própria que me impede de
  // simular com confiança uma aba "de verdade em primeiro plano" — o
  // `frameloop` condicional é exatamente o tipo de lógica que essa
  // limitação impede de validar direito. Em vez de arriscar uma TERCEIRA
  // hipótese não testada, a cena agora roda sempre (`frameloop="always"`,
  // que é o padrão do R3F) — sem nenhuma pausa condicionada a
  // observer/visibilidade. Custo: um pouco mais de bateria depois que a
  // pessoa já rolou passado o hero (a cena decorativa continua desenhando
  // fora de tela). Ganho: elimina de vez qualquer bug nessa lógica de
  // pausa como possível causa da cena não aparecer — o que importa mais
  // aqui é a cena realmente aparecer sempre.
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
