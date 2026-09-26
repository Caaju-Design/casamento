// Hero "manchas de aquarela" — Manu & Gabi
//
// Ideia: o papel começa em branco. Conforme a câmera anda (scroll), manchas de
// tinta caem na tela, se espalham como água e vão revelando a cena. As primeiras
// manchas são aguadas grandes e soltas (só cor), as seguintes vão ficando menores
// e mais concentradas no centro, trazendo detalhe (rosto, cabelo, roupa).
// As bordas da tela continuam papel.
//
// A "verdade" por baixo da tinta é o BANNERHERO (cores, luz e rostos reais).
// No site isso vira um <video> scrubado pelo scroll; aqui no preview são quadros.
import * as THREE from "three";

const params = new URLSearchParams(location.search);
const RECORD = params.has("record");
const W = Number(params.get("w") || 1280);
const H = Number(params.get("h") || 720);
const ASPECT = W / H;

const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: RECORD });
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);

const loader = new THREE.TextureLoader();
const noiseTex = await loader.loadAsync("noise.png");
noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping;
noiseTex.colorSpace = THREE.NoColorSpace;

// ---------------------------------------------------------------- manchas
// RNG determinístico: mesma pintura toda vez (e o scroll pra trás "despinta").
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const rand = rng(20261);
const gauss = () => {
  const u = Math.max(rand(), 1e-6), v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// centro de massa da composição (onde o casal termina) em uv (y pra cima)
const FOCUS = { x: 0.53, y: 0.56 };
const stains = [];
function addStains(n, s0, s1, rMin, rMax, stage0, stage1, sx, sy, str0, str1, soft0, soft1) {
  for (let i = 0; i < n; i++) {
    const k = n > 1 ? i / (n - 1) : 0;
    const spawn = s0 + (s1 - s0) * (k * 0.85 + rand() * 0.15);
    // puxa as manchas tardias pro foco; as primeiras ficam no meio da tela
    const cx = 0.5 + (FOCUS.x - 0.5) * k + gauss() * sx;
    const cy = 0.5 + (FOCUS.y - 0.5) * k + gauss() * sy;
    stains.push({
      cx, cy,
      r: rMin + (rMax - rMin) * rand(),
      spawn,
      seed: rand() * 100,
      stage: stage0 + (stage1 - stage0) * (k * 0.7 + rand() * 0.3),
      strength: str0 + (str1 - str0) * rand(),
      soft: soft0 + (soft1 - soft0) * rand(),
      elong: 1 + rand() * 0.9,
      rot: rand() * Math.PI,
    });
  }
}
//          n   spawn        raio          detalhe     espalhamento  força      borda
addStains(6, 0.0, 0.2, 0.16, 0.32, 0.0, 0.1, 0.07, 0.06, 0.55, 0.75, 0.10, 0.3);   // primeiras aguadas
addStains(24, 0.16, 0.62, 0.14, 0.26, 0.05, 0.3, 0.19, 0.12, 0.45, 0.7, 0.03, 0.2);  // a cena se abre
addStains(30, 0.5, 0.95, 0.07, 0.15, 0.45, 0.8, 0.1, 0.08, 0.45, 0.7, 0.02, 0.1);    // detalhe: casal
addStains(12, 0.78, 1.0, 0.045, 0.085, 0.9, 1.0, 0.05, 0.05, 0.5, 0.7, 0.02, 0.06);  // rostos

const N = stains.length;
const base = new THREE.PlaneGeometry(2, 2);
const geo = new THREE.InstancedBufferGeometry();
geo.index = base.index;
geo.setAttribute("position", base.getAttribute("position"));
const iA = new Float32Array(N * 4), iB = new Float32Array(N * 4), iC = new Float32Array(N * 4);
stains.forEach((s, i) => {
  iA.set([s.cx, s.cy, s.r, s.spawn], i * 4);
  iB.set([s.seed, s.stage, s.strength, s.soft], i * 4);
  iC.set([s.elong, s.rot, 0, 0], i * 4);
});
geo.setAttribute("iA", new THREE.InstancedBufferAttribute(iA, 4));
geo.setAttribute("iB", new THREE.InstancedBufferAttribute(iB, 4));
geo.setAttribute("iC", new THREE.InstancedBufferAttribute(iC, 4));
geo.instanceCount = N;

const stainMat = new THREE.ShaderMaterial({
  uniforms: { uS: { value: 0 }, uAspect: { value: ASPECT }, tNoise: { value: noiseTex } },
  transparent: true,
  depthTest: false,
  depthWrite: false,
  blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation,
  blendSrc: THREE.OneFactor,
  blendDst: THREE.OneFactor,
  vertexShader: /* glsl */ `
    attribute vec4 iA; attribute vec4 iB; attribute vec4 iC;
    uniform float uAspect;
    varying vec2 vQ; varying vec4 vB; varying float vSpawn;
    void main(){
      vec2 corner = position.xy * 1.5;           // folga pra borda irregular
      float c = cos(iC.y), s = sin(iC.y);
      vec2 p = mat2(c, s, -s, c) * (corner * vec2(iC.x, 1.0)) * iA.z;
      vec2 ndc = vec2(iA.x*2.0-1.0 + p.x*2.0/uAspect, iA.y*2.0-1.0 + p.y*2.0);
      gl_Position = vec4(ndc, 0.0, 1.0);
      vQ = corner; vB = iB; vSpawn = iA.w;
    }`,
  fragmentShader: /* glsl */ `
    uniform float uS; uniform sampler2D tNoise;
    varying vec2 vQ; varying vec4 vB; varying float vSpawn;
    void main(){
      float g = clamp((uS - vSpawn) / 0.06, 0.0, 1.0);
      if (g <= 0.0) discard;
      float spread = 1.0 - pow(1.0 - g, 3.0);          // a água corre rápido e para
      float rr = 0.3 + 0.7 * spread;
      float seed = vB.x;
      // contorno orgânico: ondas largas + recorte médio (sem serrilhado fino)
      vec2 w = (texture2D(tNoise, vQ*0.22 + seed*vec2(0.137,0.291)).rg - 0.5) * 1.1
             + (texture2D(tNoise, vQ*0.7 + seed*vec2(0.53,0.17)).gr - 0.5) * 0.22;
      float d = length(vQ + w) / rr;
      float soft = vB.w;
      float inside = 1.0 - smoothstep(1.0 - soft - 0.01, 1.0, d);
      if (inside <= 0.001) discard;
      // pigmento migra pra borda enquanto seca (anel escuro)
      float rim = pow(smoothstep(0.78, 1.0, d), 2.5) * inside * clamp(1.0 - soft*3.0, 0.0, 1.0);
      float grain = texture2D(tNoise, vQ*2.6 + seed).b;
      // floração (backrun): água volta pra dentro da mancha e empurra o pigmento,
      // deixando uma área mais clara com contorno rendado mais escuro
      float bl = texture2D(tNoise, vQ*0.55 + seed*vec2(0.31,0.77)).a;
      float hasBloom = step(0.55, fract(seed*0.618));
      float bloomIn = smoothstep(0.6, 0.64, bl) * hasBloom * spread;
      float bloomEdge = (smoothstep(0.56, 0.6, bl) - smoothstep(0.6, 0.64, bl)) * hasBloom * spread;
      rim += bloomEdge * 0.8 * inside;
      // enquanto molhada a mancha é mais escura; seca e clareia um pouco
      float wet = 1.15 - 0.15 * spread;
      float pig = inside * vB.z * (0.8 + 0.3 * grain) * wet * (1.0 - 0.35*bloomIn);
      gl_FragColor = vec4(pig, max(rim,0.0) * vB.z, pig * vB.y, 0.0);
    }`,
});
const stainScene = new THREE.Scene();
const stainMesh = new THREE.Mesh(geo, stainMat);
stainMesh.frustumCulled = false;
stainScene.add(stainMesh);
const maskRT = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });

// --------------------------------------------------------------- composição
const compMat = new THREE.ShaderMaterial({
  uniforms: {
    tSrc: { value: null },
    tMask: { value: maskRT.texture },
    tNoise: { value: noiseTex },
    uAspect: { value: ASPECT },
    uRes: { value: new THREE.Vector2(W, H) },
  },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tSrc; uniform sampler2D tMask; uniform sampler2D tNoise;
    uniform float uAspect; uniform vec2 uRes;
    varying vec2 vUv;
    float lum(vec3 c){ return dot(c, vec3(0.299,0.587,0.114)); }
    void main(){
      vec2 uv = vUv;
      vec2 q = uv * vec2(uAspect, 1.0);
      vec2 px = 1.0 / uRes;

      // papel prensado a frio: grão fino + ondulação
      float pg = texture2D(tNoise, q*2.4).r*0.55 + texture2D(tNoise, q*7.5).g*0.45;
      float pgh = texture2D(tNoise, q*7.5 + px*vec2(3.0,3.0)).g;
      vec3 paper = vec3(0.975, 0.962, 0.930);

      vec4 m = texture2D(tMask, uv + (texture2D(tNoise, q*1.7).rg - 0.5) * 0.004);
      float P = m.r, E = m.g;

      // a tinta "anda" um pouco no papel molhado
      vec2 fl = (texture2D(tNoise, q*1.2).ba - 0.5) * 0.008;
      vec3 wash = (textureLod(tSrc, uv+fl, 5.2).rgb * 2.0
                 + textureLod(tSrc, uv+fl+vec2(0.012,0.0), 4.6).rgb
                 + textureLod(tSrc, uv+fl-vec2(0.0,0.015), 4.6).rgb) / 4.0;
      wash = mix(wash, floor(wash*7.0+0.5)/7.0, 0.35);
      vec3 mid = textureLod(tSrc, uv+fl*0.6, 3.0).rgb;
      mid = mix(mid, floor(mid*10.0+0.5)/10.0, 0.2);
      vec3 fine = textureLod(tSrc, uv+fl*0.2, 0.6).rgb;

      // detalhe acumulado: aguadas iniciais quase não somam, manchas tardias trazem o desenho
      float dA = smoothstep(0.05, 0.35, m.b);
      float dB = smoothstep(0.35, 1.0, m.b);
      vec3 src = mix(mix(wash, mid, dA), fine, dB);

      // modelo de pigmento transparente: camadas finas = tom claro,
      // camadas sobrepostas = cor cheia; borda da mancha concentra pigmento
      vec3 A = -log(clamp(src, 0.03, 1.0));
      float T = 1.0 - exp(-P * 2.0);
      T *= 0.9 + 0.16 * pg;                                 // granulação no vale do papel
      T = min(T, 1.0) + min(E, 1.5) * 0.28;                 // borda seca mais carregada
      vec3 col = paper * exp(-A * T * 0.97);

      // desenho a lápis por baixo (só onde já tem tinta)
      float l1 = lum(textureLod(tSrc, uv + vec2(px.x*1.5,0.0), 1.2).rgb);
      float l2 = lum(textureLod(tSrc, uv - vec2(px.x*1.5,0.0), 1.2).rgb);
      float l3 = lum(textureLod(tSrc, uv + vec2(0.0,px.y*1.5), 1.2).rgb);
      float l4 = lum(textureLod(tSrc, uv - vec2(0.0,px.y*1.5), 1.2).rgb);
      float edge = smoothstep(0.12, 0.3, length(vec2(l1-l2, l3-l4)));
      col *= 1.0 - edge * 0.18 * smoothstep(0.08, 0.6, P);

      // relevo do papel
      col *= 0.965 + 0.05 * pg + (pg - pgh) * 0.06;
      gl_FragColor = vec4(col, 1.0);
    }`,
  depthTest: false,
  depthWrite: false,
});
const compScene = new THREE.Scene();
compScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), compMat));
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

function render(srcTex, s) {
  stainMat.uniforms.uS.value = s;
  renderer.setRenderTarget(maskRT);
  renderer.setClearColor(0x000000, 0);
  renderer.clear();
  renderer.render(stainScene, cam);
  renderer.setRenderTarget(null);
  compMat.uniforms.tSrc.value = srcTex;
  renderer.render(compScene, cam);
}

// ------------------------------------------------------------------ preview
const FRAMES = 241;
const cache = new Map();
function frameTex(i) {
  i = Math.max(1, Math.min(FRAMES, i));
  if (!cache.has(i)) {
    cache.set(i, loader.loadAsync(`frames/f_${String(i).padStart(3, "0")}.jpg`).then((t) => {
      t.colorSpace = THREE.NoColorSpace;
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      return t;
    }));
  }
  return cache.get(i);
}

// Linha do tempo do preview (no site: intro = ao carregar, resto = scroll)
//   0.0–2.5s  primeiras aguadas caem com a câmera parada
//   2.5–12.5s câmera anda (vídeo 0→10s) e mais tinta vai caindo
const INTRO = 2.5, MOVE = 10.0;
window.renderAt = async (t) => {
  const move = Math.min(Math.max((t - INTRO) / MOVE, 0), 1);
  const s = t < INTRO ? (t / INTRO) * 0.16 : 0.16 + move * 0.84;
  const tex = await frameTex(1 + Math.round(move * (FRAMES - 1)));
  render(tex, s);
  const old = [...cache.keys()].filter((k) => k < 1 + Math.round(move * (FRAMES - 1)) - 2);
  old.forEach((k) => cache.get(k).then((x) => x.dispose()) && cache.delete(k));
};
window.sceneReady = Promise.resolve(true);
