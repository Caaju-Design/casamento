import * as THREE from "three";
import type { FrameSource } from "./frames";

/**
 * Motor do hero em aquarela: papel em branco onde manchas de tinta caem, se
 * espalham como água e vão revelando os quadros do BANNERHERO por baixo.
 *
 * Duas passadas por quadro, as duas bem leves:
 *  1. MÁSCARA: cada mancha é um quad instanciado desenhado com blending
 *     aditivo num render target. Canais: R = quantidade de tinta,
 *     G = pigmento acumulado na borda (anel escuro), B = detalhe acumulado.
 *  2. COMPOSIÇÃO: lê a máscara e o quadro atual do vídeo e aplica o modelo de
 *     pigmento transparente (camada fina = tom claro, sobreposição = cor
 *     cheia), aguada solta → meio-tom → detalhe fino, granulação, lápis e
 *     relevo do papel.
 *
 * Tudo é determinístico a partir do "progresso da pintura" (0→1): rolar pra
 * trás despinta, e não existe estado acumulado entre frames.
 */

// A máscara vai num render target de 8 bits (funciona em qualquer celular,
// sem depender de extensão de float). Os valores são guardados divididos
// por MASK_SCALE pra caber na faixa 0–1 sem saturar cedo.
const MASK_SCALE = 4.0;

// Proporção dos quadros do BANNERHERO (16:9).
const IMAGE_ASPECT = 16 / 9;

// ------------------------------------------------------------------ manchas
type Stain = {
  cx: number; cy: number; r: number; spawn: number; seed: number;
  stage: number; strength: number; soft: number; elong: number; rot: number;
};

function buildStains(count: "full" | "lite"): Stain[] {
  let s = 20261 >>> 0;
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const gauss = () => {
    const u = Math.max(rand(), 1e-6), v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  // Centro de massa da composição no fim (onde o casal se beija), em uv da imagem (y pra cima).
  const FOCUS = { x: 0.53, y: 0.56 };
  const k = count === "lite" ? 0.75 : 1; // celular: menos manchas, um pouco maiores
  const out: Stain[] = [];
  const add = (n: number, s0: number, s1: number, rMin: number, rMax: number, st0: number, st1: number,
    sx: number, sy: number, str0: number, str1: number, soft0: number, soft1: number) => {
    const nn = Math.max(1, Math.round(n * k));
    const grow = 1 / Math.sqrt(k);
    for (let i = 0; i < nn; i++) {
      const t = nn > 1 ? i / (nn - 1) : 0;
      out.push({
        spawn: s0 + (s1 - s0) * (t * 0.85 + rand() * 0.15),
        // no celular em pé só ~56% da largura da imagem aparece: aperta o
        // espalhamento horizontal pra tinta não bater chapada nas laterais
        cx: 0.5 + (FOCUS.x - 0.5) * t + gauss() * sx * (count === "lite" ? 0.6 : 1),
        cy: 0.5 + (FOCUS.y - 0.5) * t + gauss() * sy,
        r: (rMin + (rMax - rMin) * rand()) * grow,
        seed: rand() * 100,
        stage: st0 + (st1 - st0) * (t * 0.7 + rand() * 0.3),
        strength: str0 + (str1 - str0) * rand(),
        soft: soft0 + (soft1 - soft0) * rand(),
        elong: 1 + rand() * 0.9,
        rot: rand() * Math.PI,
      });
    }
  };
  //    n   spawn        raio          detalhe    espalhamento   força      borda
  add(6, 0.0, 0.2, 0.16, 0.32, 0.0, 0.1, 0.07, 0.06, 0.55, 0.75, 0.1, 0.3); //   primeiras aguadas
  add(24, 0.16, 0.62, 0.14, 0.26, 0.05, 0.3, 0.19, 0.12, 0.45, 0.7, 0.03, 0.2); // a cena se abre
  add(30, 0.5, 0.95, 0.07, 0.15, 0.45, 0.8, 0.1, 0.08, 0.45, 0.7, 0.02, 0.1); //   detalhe: casal
  add(12, 0.78, 1.0, 0.045, 0.085, 0.9, 1.0, 0.05, 0.05, 0.5, 0.7, 0.02, 0.06); // rostos
  return out;
}

const STAIN_VERT = /* glsl */ `
  attribute vec4 iA; attribute vec4 iB; attribute vec4 iC;
  uniform vec4 uRect;      // retângulo da imagem na tela, em uv (x0, y0, w, h)
  varying vec2 vQ; varying vec4 vB; varying float vSpawn;
  void main(){
    vec2 corner = position.xy * 1.5;            // folga pra borda irregular
    float c = cos(iC.y), s = sin(iC.y);
    vec2 q = mat2(c, s, -s, c) * (corner * vec2(iC.x, 1.0)) * iA.z; // em "alturas da imagem"
    vec2 img = iA.xy + vec2(q.x / ${IMAGE_ASPECT.toFixed(6)}, q.y);
    vec2 scr = uRect.xy + img * uRect.zw;
    gl_Position = vec4(scr * 2.0 - 1.0, 0.0, 1.0);
    vQ = corner; vB = iB; vSpawn = iA.w;
  }`;

const STAIN_FRAG = /* glsl */ `
  uniform float uS; uniform sampler2D tNoise;
  varying vec2 vQ; varying vec4 vB; varying float vSpawn;
  void main(){
    float g = clamp((uS - vSpawn) / 0.06, 0.0, 1.0);
    if (g <= 0.0) discard;
    float spread = 1.0 - pow(1.0 - g, 3.0);           // a água corre rápido e para
    float rr = 0.3 + 0.7 * spread;
    float seed = vB.x;
    vec2 w = (texture2D(tNoise, vQ*0.22 + seed*vec2(0.137,0.291)).rg - 0.5) * 1.1
           + (texture2D(tNoise, vQ*0.7 + seed*vec2(0.53,0.17)).gr - 0.5) * 0.22;
    float d = length(vQ + w) / rr;
    float soft = vB.w;
    float inside = 1.0 - smoothstep(1.0 - soft - 0.01, 1.0, d);
    if (inside <= 0.001) discard;
    float rim = pow(smoothstep(0.78, 1.0, d), 2.5) * inside * clamp(1.0 - soft*3.0, 0.0, 1.0);
    float grain = texture2D(tNoise, vQ*2.6 + seed).b;
    // floração (backrun): água volta pra dentro e empurra o pigmento
    float bl = texture2D(tNoise, vQ*0.55 + seed*vec2(0.31,0.77)).a;
    float hasBloom = step(0.55, fract(seed*0.618));
    float bloomIn = smoothstep(0.6, 0.64, bl) * hasBloom * spread;
    float bloomEdge = (smoothstep(0.56, 0.6, bl) - smoothstep(0.6, 0.64, bl)) * hasBloom * spread;
    rim += bloomEdge * 0.8 * inside;
    float wet = 1.15 - 0.15 * spread;                 // molhada é mais escura, seca clareia
    float pig = inside * vB.z * (0.8 + 0.3 * grain) * wet * (1.0 - 0.35*bloomIn);
    gl_FragColor = vec4(pig, max(rim, 0.0) * vB.z, pig * vB.y, 0.0) / ${MASK_SCALE.toFixed(1)};
  }`;

const COMP_FRAG = /* glsl */ `
  uniform sampler2D tSrcA; uniform sampler2D tSrcB; uniform float uMix;
  uniform sampler2D tMask; uniform sampler2D tNoise;
  uniform vec4 uRect; uniform vec2 uRes; uniform float uHasSrc;
  varying vec2 vUv;
  float lum(vec3 c){ return dot(c, vec3(0.299,0.587,0.114)); }
  // quadros vêm sem flip (ImageBitmap): linha 0 é o topo
  vec3 src(vec2 uv, float lod){
    vec2 t = vec2(uv.x, 1.0 - uv.y);
    return mix(textureLod(tSrcA, t, lod).rgb, textureLod(tSrcB, t, lod).rgb, uMix);
  }
  void main(){
    vec2 uv = vUv;
    float asp = uRes.x / uRes.y;
    vec2 q = uv * vec2(asp, 1.0);
    vec2 px = 1.0 / uRes;

    float pg = texture2D(tNoise, q*2.4).r*0.55 + texture2D(tNoise, q*7.5).g*0.45;
    float pgh = texture2D(tNoise, q*7.5 + px*3.0).g;
    vec3 paper = vec3(0.961, 0.949, 0.929);           // = color.background.page (linho.50 #f5f2ed)

    vec4 m = texture2D(tMask, uv + (texture2D(tNoise, q*1.7).rg - 0.5) * 0.004) * ${MASK_SCALE.toFixed(1)};
    float P = m.r, E = m.g;

    vec2 iuv = (uv - uRect.xy) / uRect.zw;            // uv dentro da imagem
    // fora da imagem (celular em pé): a tinta morre numa borda irregular
    vec2 outside = max(max(-iuv, iuv - 1.0), 0.0);
    float od = length(outside * vec2(${IMAGE_ASPECT.toFixed(6)}, 1.0)); // em "alturas da imagem"
    // borda que serpenteia (não um retângulo): ruído largo + recorte médio
    float edgeN = texture2D(tNoise, q*0.45 + 7.0).r * 0.7 + texture2D(tNoise, q*1.6 + 3.0).g * 0.3;
    float keep = 1.0 - smoothstep(0.0, 0.01 + edgeN*0.12, od);
    P *= keep; E *= keep;

    vec2 fl = (texture2D(tNoise, q*1.2).ba - 0.5) * 0.008;
    vec2 ci = clamp(iuv, 0.0, 1.0);
    vec3 wash = (src(ci+fl, 5.2) * 2.0 + src(ci+fl+vec2(0.012,0.0), 4.6) + src(ci+fl-vec2(0.0,0.015), 4.6)) / 4.0;
    wash = mix(wash, floor(wash*7.0+0.5)/7.0, 0.35);
    vec3 mid = src(ci+fl*0.6, 3.0);
    mid = mix(mid, floor(mid*10.0+0.5)/10.0, 0.2);
    vec3 fine = src(ci+fl*0.2, 0.6);
    float dA = smoothstep(0.05, 0.35, m.b);
    float dB = smoothstep(0.35, 1.0, m.b);
    vec3 s = mix(mix(wash, mid, dA), fine, dB);
    s = mix(paper, s, uHasSrc);

    // pigmento transparente sobre o papel
    vec3 A = -log(clamp(s, 0.03, 1.0));
    float T = 1.0 - exp(-P * 2.0);
    T *= 0.9 + 0.16 * pg;
    T = min(T, 1.0) + min(E, 1.5) * 0.28;
    vec3 col = paper * exp(-A * T * 0.97);

    // lápis por baixo (só onde já tem tinta)
    vec2 pi = px / uRect.zw * 1.5;
    float l1 = lum(src(ci + vec2(pi.x,0.0), 1.2)), l2 = lum(src(ci - vec2(pi.x,0.0), 1.2));
    float l3 = lum(src(ci + vec2(0.0,pi.y), 1.2)), l4 = lum(src(ci - vec2(0.0,pi.y), 1.2));
    float edge = smoothstep(0.12, 0.3, length(vec2(l1-l2, l3-l4))) * uHasSrc;
    col *= 1.0 - edge * 0.18 * smoothstep(0.08, 0.6, P);

    col *= 0.975 + 0.035 * pg + (pg - pgh) * 0.05;   // relevo do papel
    gl_FragColor = vec4(col, 1.0);
  }`;

export type EngineOptions = { lite: boolean; noise: THREE.Texture };

export class WatercolorEngine {
  readonly renderer: THREE.WebGLRenderer;
  private stainMat: THREE.ShaderMaterial;
  private compMat: THREE.ShaderMaterial;
  private su: { uS: THREE.IUniform<number>; uRect: THREE.IUniform<THREE.Vector4>; tNoise: THREE.IUniform<THREE.Texture> };
  private cu: {
    tSrcA: THREE.IUniform<THREE.Texture>; tSrcB: THREE.IUniform<THREE.Texture>; uMix: THREE.IUniform<number>;
    uHasSrc: THREE.IUniform<number>; tMask: THREE.IUniform<THREE.Texture>; tNoise: THREE.IUniform<THREE.Texture>;
    uRect: THREE.IUniform<THREE.Vector4>; uRes: THREE.IUniform<THREE.Vector2>;
  };
  private stainScene = new THREE.Scene();
  private compScene = new THREE.Scene();
  private cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private maskRT: THREE.WebGLRenderTarget;
  private lite: boolean;
  private blank: THREE.DataTexture;
  private texCache = new Map<number, THREE.Texture>();
  private width = 1;
  private height = 1;

  constructor(canvas: HTMLCanvasElement, opts: EngineOptions) {
    this.lite = opts.lite;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // os quadros já são cor de tela

    const noise = opts.noise;
    noise.wrapS = noise.wrapT = THREE.RepeatWrapping;
    noise.colorSpace = THREE.NoColorSpace;

    const stains = buildStains(opts.lite ? "lite" : "full");
    const base = new THREE.PlaneGeometry(2, 2);
    const geo = new THREE.InstancedBufferGeometry();
    geo.index = base.index;
    geo.setAttribute("position", base.getAttribute("position"));
    const n = stains.length;
    const iA = new Float32Array(n * 4), iB = new Float32Array(n * 4), iC = new Float32Array(n * 4);
    stains.forEach((s, i) => {
      iA.set([s.cx, s.cy, s.r, s.spawn], i * 4);
      iB.set([s.seed, s.stage, s.strength, s.soft], i * 4);
      iC.set([s.elong, s.rot, 0, 0], i * 4);
    });
    geo.setAttribute("iA", new THREE.InstancedBufferAttribute(iA, 4));
    geo.setAttribute("iB", new THREE.InstancedBufferAttribute(iB, 4));
    geo.setAttribute("iC", new THREE.InstancedBufferAttribute(iC, 4));
    geo.instanceCount = n;

    this.su = { uS: { value: 0 }, uRect: { value: new THREE.Vector4(0, 0, 1, 1) }, tNoise: { value: noise } };
    this.stainMat = new THREE.ShaderMaterial({
      uniforms: this.su,
      vertexShader: STAIN_VERT,
      fragmentShader: STAIN_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneFactor,
      blendDst: THREE.OneFactor,
    });
    const stainMesh = new THREE.Mesh(geo, this.stainMat);
    stainMesh.frustumCulled = false;
    this.stainScene.add(stainMesh);

    this.maskRT = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false });

    this.blank = new THREE.DataTexture(new Uint8Array([245, 242, 237, 255]), 1, 1);
    this.blank.needsUpdate = true;

    this.cu = {
      tSrcA: { value: this.blank },
      tSrcB: { value: this.blank },
      uMix: { value: 0 },
      uHasSrc: { value: 0 },
      tMask: { value: this.maskRT.texture },
      tNoise: { value: noise },
      uRect: { value: new THREE.Vector4(0, 0, 1, 1) },
      uRes: { value: new THREE.Vector2(1, 1) },
    };
    this.compMat = new THREE.ShaderMaterial({
      uniforms: this.cu,
      vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
      fragmentShader: COMP_FRAG,
      depthTest: false,
      depthWrite: false,
    });
    this.compScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.compMat));
  }

  resize(cssW: number, cssH: number, dpr: number) {
    this.width = cssW;
    this.height = cssH;
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(cssW, cssH, false);
    const w = Math.max(1, Math.round(cssW * dpr));
    const h = Math.max(1, Math.round(cssH * dpr));
    const maskDiv = this.lite ? 2 : 1;
    this.maskRT.setSize(Math.ceil(w / maskDiv), Math.ceil(h / maskDiv));
    this.cu.uRes.value.set(w, h);
  }

  /**
   * Onde a imagem fica na tela. Paisagem: cobre a tela toda (como
   * `object-fit: cover`). Retrato (celular em pé): uma "folha" quadrada no
   * meio, com papel em cima e embaixo — a aquarela fica emoldurada pelo
   * papel em vez de cortar o casal pela metade. `focusU` = qual coluna da
   * imagem fica no centro (acompanha o casal quando ele vai pra direita).
   */
  private computeRect(focusU: number): THREE.Vector4 {
    const vw = this.width, vh = this.height;
    let wPx: number, hPx: number;
    if (vw / vh >= 0.9) {
      if (vw / vh > IMAGE_ASPECT) { wPx = vw; hPx = vw / IMAGE_ASPECT; } else { hPx = vh; wPx = vh * IMAGE_ASPECT; }
    } else {
      hPx = Math.min(vw * 1.1, vh * 0.66);
      wPx = hPx * IMAGE_ASPECT;
    }
    const w = wPx / vw, h = hPx / vh;
    let x0 = 0.5 - focusU * w;
    if (w >= 1) x0 = Math.min(0, Math.max(1 - w, x0));
    const y0 = 0.5 - h / 2 + (vw / vh < 0.9 ? 0.02 : 0);
    return new THREE.Vector4(x0, y0, w, h);
  }

  private textureFor(index: number, source: FrameSource): THREE.Texture {
    let tex = this.texCache.get(index);
    if (!tex) {
      tex = new THREE.Texture(source as TexImageSource as HTMLImageElement);
      tex.flipY = false;
      tex.colorSpace = THREE.NoColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      this.texCache.set(index, tex);
      // mantém só alguns quadros na GPU
      if (this.texCache.size > 4) {
        const oldest = this.texCache.keys().next().value as number;
        this.texCache.get(oldest)?.dispose();
        this.texCache.delete(oldest);
      }
    } else {
      // reinsere no fim (LRU)
      this.texCache.delete(index);
      this.texCache.set(index, tex);
    }
    return tex;
  }

  /**
   * Desenha um quadro.
   *  - `paint`: progresso da pintura (0 = papel em branco, 1 = pintura completa).
   *  - `a`/`b`/`mix`: quadros vizinhos da sequência e a mistura entre eles
   *    (a transição entre quadros fica suave mesmo com 12 quadros/segundo).
   */
  render(paint: number, a: { index: number; source: FrameSource } | null,
    b: { index: number; source: FrameSource } | null, mix: number, focusU: number) {
    const rect = this.computeRect(focusU);
    this.su.uS.value = paint;
    this.su.uRect.value.copy(rect);
    this.cu.uRect.value.copy(rect);

    const u = this.cu;
    if (a) {
      u.tSrcA.value = this.textureFor(a.index, a.source);
      u.tSrcB.value = b ? this.textureFor(b.index, b.source) : u.tSrcA.value;
      u.uMix.value = b ? mix : 0;
      u.uHasSrc.value = 1;
    } else {
      u.tSrcA.value = this.blank;
      u.tSrcB.value = this.blank;
      u.uHasSrc.value = 0;
    }

    this.renderer.setRenderTarget(this.maskRT);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.clear();
    this.renderer.render(this.stainScene, this.cam);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.compScene, this.cam);
  }

  /** Índices que ainda estão em uso na GPU (não liberar a imagem de origem antes do upload). */
  get texturesInUse(): number[] {
    return [...this.texCache.keys()];
  }

  dispose() {
    for (const t of this.texCache.values()) t.dispose();
    this.texCache.clear();
    this.maskRT.dispose();
    this.stainMat.dispose();
    this.compMat.dispose();
    this.blank.dispose();
    this.renderer.dispose();
  }
}
