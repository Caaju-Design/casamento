// Hero 3D aquarela — Manu & Gabi
// Cena modelada no Blender (scene.glb) + materiais "pintados" + pós-processo aquarela.
// Modos:
//   - normal: pinta a cena ao carregar e a câmera anda com o scroll
//   - ?record: expõe window.renderAt(segundos) pra gravar o preview quadro a quadro
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const params = new URLSearchParams(location.search);
const RECORD = params.has("record");

const canvas = document.getElementById("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: RECORD });
renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // cores já são "de tela"
renderer.setPixelRatio(RECORD ? 1 : Math.min(window.devicePixelRatio, 1.5));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1000);

// Sol atrás da copa no começo (Blender (-5, 60, 14) -> three (-5, 14, -60))
const SUN = new THREE.Vector3(-5, 14, -60).normalize();
const FOG = new THREE.Color(0.9, 0.86, 0.8);

// ------------------------------------------------------------------ GLSL util
const NOISE = /* glsl */ `
float hash3(vec3 p){ p=fract(p*0.3183099+.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise3(vec3 x){ vec3 i=floor(x); vec3 f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hash3(i+vec3(0,0,0)),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z); }
float hash2(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float noise2(vec2 p){ vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash2(i),hash2(i+vec2(1,0)),f.x),mix(hash2(i+vec2(0,1)),hash2(i+vec2(1,1)),f.x),f.y); }
float fbm2(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise2(p); p=p*2.03+17.1; a*=0.5; } return v; }
float fbm3(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){ v+=a*noise3(p); p=p*2.03+17.1; a*=0.5; } return v; }
`;

// ------------------------------------------------------- material "pintado"
// kind: 0 tronco, 1 copa/folhagem, 2 chão, 3 pessoas, 4 lago, 5 colinas
function paintMaterial(kind) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSun: { value: SUN },
      uCamPos: { value: camera.position },
      uFog: { value: FOG },
      uKind: { value: kind },
    },
    side: THREE.DoubleSide,
    vertexShader: /* glsl */ `
      attribute vec3 aCol;
      varying vec3 vCol; varying vec3 vN; varying vec3 vW;
      void main(){
        vCol = aCol;
        vec4 wp = modelMatrix * vec4(position,1.0);
        vW = wp.xyz;
        vN = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uSun; uniform vec3 uCamPos; uniform vec3 uFog; uniform float uKind;
      varying vec3 vCol; varying vec3 vN; varying vec3 vW;
      ${NOISE}
      void main(){
        vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n;
        vec3 V = normalize(uCamPos - vW);
        vec3 base = vCol;
        float nz = fbm3(vW*0.7);
        float nz2 = noise3(vW*3.3);

        if(uKind==1.0){ base *= 0.78 + 0.45*nz; }
        if(uKind==2.0){
          float stripes = fbm3(vec3(vW.x*0.35, 0.0, vW.z*1.6));
          base *= 0.86 + 0.28*stripes;
          float speck = smoothstep(0.78,0.86,noise3(vW*vec3(7.0,1.0,7.0)));
          base = mix(base, vec3(0.97,0.84,0.80), speck*0.55);
        }
        if(uKind==0.0){ base *= 0.8 + 0.4*noise3(vec3(vW.x*6.0, vW.y*0.8, vW.z*6.0)); }
        if(uKind==5.0){ base *= 0.9 + 0.2*nz; }

        // luz "aguada": sombra fria violeta, luz quente, borda da sombra quebrada
        float wrap = dot(n, uSun)*0.5 + 0.5;
        float s = smoothstep(0.28, 0.72, wrap + (nz2-0.5)*0.3);
        vec3 lit = base * mix(vec3(0.60,0.56,0.76), vec3(1.07,1.02,0.94), s);

        // contraluz na copa (sol atravessando as folhas)
        float back = pow(max(dot(-V, uSun), 0.0), 5.0);
        if(uKind==1.0) lit += vec3(0.95,0.38,0.12) * back * (0.3 + 0.45*nz);
        // aro de luz nas silhuetas (pessoas e tronco)
        float rim = pow(1.0 - max(dot(n, V), 0.0), 3.0);
        lit += vec3(1.0,0.82,0.58) * rim * 0.22 * clamp(dot(-V,uSun)+0.4, 0.0, 1.0);

        if(uKind==4.0){ // lago: reflete o céu, com riscos
          float st = noise3(vec3(vW.x*0.15, 0.0, vW.z*2.5));
          lit = mix(vec3(0.66,0.76,0.84), vec3(0.96,0.9,0.82), 0.35 + 0.35*st);
        }

        // perspectiva aérea (lava a tinta na distância)
        float d = length(uCamPos - vW);
        float f = 1.0 - exp(-d*0.011);
        lit = mix(lit, uFog, clamp(f*0.9, 0.0, 0.85));
        gl_FragColor = vec4(lit, 1.0);
      }`,
  });
}

// ---------------------------------------------------------------------- céu
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(500, 48, 24),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: { uSun: { value: SUN }, uCamPos: { value: camera.position } },
    vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 wp=modelMatrix*vec4(position,1.0); vW=wp.xyz; gl_Position=projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uSun; uniform vec3 uCamPos; varying vec3 vW;
      ${NOISE}
      void main(){
        vec3 d = normalize(vW - uCamPos);
        float h = d.y;
        vec3 top = vec3(0.56,0.69,0.86), mid = vec3(0.93,0.82,0.80), hor = vec3(1.0,0.87,0.70);
        vec3 col = mix(hor, mid, smoothstep(0.0, 0.12, h));
        col = mix(col, top, smoothstep(0.1, 0.55, h));
        float sd = max(dot(d, uSun), 0.0);
        col += vec3(1.0,0.72,0.42)*pow(sd,6.0)*0.45;
        col += vec3(1.0,0.97,0.88)*smoothstep(0.9965,0.9985,sd);
        vec2 cp = d.xz/(h+0.18)*1.6;
        float c = fbm2(cp + vec2(3.0,1.0));
        col = mix(col, vec3(1.0,0.95,0.9), smoothstep(0.55,0.78,c)*smoothstep(0.02,0.2,h)*0.75);
        gl_FragColor = vec4(col,1.0);
      }`,
  })
);
sky.renderOrder = -1;
scene.add(sky);

// ------------------------------------------------------------ folhas caindo
const LEAVES = 220;
const seeds = new Float32Array(LEAVES * 4);
for (let i = 0; i < LEAVES * 4; i++) seeds[i] = Math.random();
const leafGeo = new THREE.BufferGeometry();
leafGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(LEAVES * 3), 3));
leafGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 4));
const leafMat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uH: { value: 720 }, uFog: { value: FOG }, uCamPos: { value: camera.position } },
  transparent: true,
  depthWrite: false,
  vertexShader: /* glsl */ `
    attribute vec4 aSeed; uniform float uTime; uniform float uH;
    varying vec4 vSeed; varying float vRot;
    void main(){
      float a = aSeed.x*6.2831; float r = 0.6 + aSeed.z*6.0;
      float y = mod(aSeed.y*9.0 - uTime*(0.35+aSeed.w*0.35), 9.0) + 0.1;
      vec3 p = vec3(cos(a)*r, y, sin(a)*r);
      p.x += sin(uTime*0.9 + aSeed.w*20.0)*0.6 + uTime*0.12;
      p.z += cos(uTime*0.7 + aSeed.x*20.0)*0.4;
      vec4 mv = viewMatrix * vec4(p,1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = clamp(0.16 * uH / -mv.z * 1.4, 1.0, 90.0);
      vSeed = aSeed; vRot = uTime*(1.0+aSeed.z*2.0) + aSeed.y*6.28;
    }`,
  fragmentShader: /* glsl */ `
    varying vec4 vSeed; varying float vRot;
    void main(){
      vec2 p = gl_PointCoord - 0.5;
      float c = cos(vRot), s = sin(vRot);
      p = mat2(c,-s,s,c)*p;
      float sq = 0.55 + 0.45*abs(sin(vRot*0.7)); // "virando" no ar
      p.x /= sq;
      float d = length(p*vec2(1.0,1.7));
      float a = smoothstep(0.42, 0.34, d);
      if(a < 0.02) discard;
      vec3 c1 = mix(vec3(0.75,0.1,0.08), vec3(0.95,0.5,0.12), vSeed.z);
      gl_FragColor = vec4(c1, a*0.95);
    }`,
});
const leaves = new THREE.Points(leafGeo, leafMat);
leaves.frustumCulled = false;
scene.add(leaves);

// -------------------------------------------------------------- pós aquarela
let W = 1280, H = 720;
const depthTex = new THREE.DepthTexture(W, H);
const rt = new THREE.WebGLRenderTarget(W, H, { depthTexture: depthTex });
const post = new THREE.ShaderMaterial({
  uniforms: {
    tCol: { value: rt.texture },
    tDepth: { value: depthTex },
    uRes: { value: new THREE.Vector2(W, H) },
    uReveal: { value: 0 },
    uNear: { value: camera.near },
    uFar: { value: camera.far },
  },
  vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tCol; uniform sampler2D tDepth; uniform vec2 uRes;
    uniform float uReveal; uniform float uNear; uniform float uFar;
    varying vec2 vUv;
    ${NOISE}
    float lum(vec3 c){ return dot(c, vec3(0.299,0.587,0.114)); }
    float linD(vec2 uv){ float z = texture2D(tDepth, uv).x*2.0-1.0;
      return (2.0*uNear*uFar)/(uFar+uNear - z*(uFar-uNear)); }
    void main(){
      vec2 px = 1.0/uRes;
      vec2 uv = vUv;
      float asp = uRes.x/uRes.y;
      // 1) contorno tremido de pincel
      vec2 q = uv*vec2(asp,1.0);
      vec2 wob = vec2(fbm2(q*9.0+3.0), fbm2(q*9.0+11.0)) - 0.5;
      vec2 wuv = uv + wob*px*7.0;

      // 2) tinta sangrando (blur gaussiano suave misturado)
      vec3 sharp = texture2D(tCol, wuv).rgb;
      vec3 acc = vec3(0.0); float tot = 0.0;
      for(int i=-2;i<=2;i++) for(int j=-2;j<=2;j++){
        vec2 o = vec2(float(i),float(j));
        float w = exp(-dot(o,o)/3.0);
        acc += texture2D(tCol, wuv + o*px*1.8).rgb*w; tot += w;
      }
      vec3 c = mix(sharp, acc/tot, 0.65);

      // 3) pigmento acumulando nas bordas (cor + profundidade)
      float gx = lum(texture2D(tCol, wuv+vec2(2.0,0.0)*px).rgb) - lum(texture2D(tCol, wuv-vec2(2.0,0.0)*px).rgb);
      float gy = lum(texture2D(tCol, wuv+vec2(0.0,2.0)*px).rgb) - lum(texture2D(tCol, wuv-vec2(0.0,2.0)*px).rgb);
      float e = clamp(length(vec2(gx,gy))*2.6, 0.0, 1.0);
      float d0 = linD(wuv);
      float dd = abs(linD(wuv+vec2(2.0,0.0)*px)-d0) + abs(linD(wuv+vec2(0.0,2.0)*px)-d0);
      float de = clamp(dd/d0*6.0, 0.0, 1.0);
      float edge = max(e, de*0.8);
      c = mix(c, c*c*0.92, edge*0.6);

      // 4) granulação + aguada irregular
      float g  = noise2(uv*uRes/2.5);
      float g2 = fbm2(q*14.0);
      c *= 0.94 + 0.1*g*(1.0-lum(c));
      c *= 0.9 + 0.2*g2;
      // leve achatamento de valores (manchas chapadas típicas da aquarela)
      c = mix(c, floor(c*7.0+0.5)/7.0, 0.18);

      // 5) papel
      float fib = fbm2(uv*uRes/5.0);
      vec3 paper = vec3(0.972,0.952,0.912) * (0.95 + 0.06*fib);
      vec3 painted = c * (0.95 + 0.06*fib);

      // 6) revelação: o pintor faz o céu, depois o fundo, por fim a frente
      float order = 1.0 - clamp(log(d0)/log(140.0), 0.0, 1.0);
      vec2 ruv = mat2(0.82,-0.57,0.57,0.82)*q;
      float stroke = fbm2(ruv*vec2(1.6,8.0))*0.45 + fbm2(q*2.5)*0.3;
      float m = order*0.55 + stroke;
      float thr = uReveal*1.45 - 0.12;
      float a = smoothstep(thr, thr-0.07, m);
      float tide = smoothstep(thr-0.12, thr-0.03, m) * a;          // borda molhada
      painted = mix(painted, painted*painted*1.05, tide*0.45);
      vec3 col = mix(paper, painted, a);

      // 7) respiro de papel nas bordas da tela
      vec2 vq = (uv-0.5)*vec2(1.0,1.1);
      float vig = smoothstep(0.62, 0.9, length(vq) + (fbm2(q*4.0)-0.5)*0.25);
      col = mix(col, paper, vig*0.85);
      gl_FragColor = vec4(col, 1.0);
    }`,
  depthTest: false,
  depthWrite: false,
});
const postScene = new THREE.Scene();
const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));

function resize(w, h) {
  W = w; H = h;
  renderer.setSize(w, h, false);
  const pr = renderer.getPixelRatio();
  rt.setSize(w * pr, h * pr);
  post.uniforms.uRes.value.set(w * pr, h * pr);
  leafMat.uniforms.uH.value = h * pr;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}

// ------------------------------------------------------------ câmera (Blender -> three: x, z, -y)
const b2t = (x, y, z) => new THREE.Vector3(x, z, -y);
const camPath = new THREE.CatmullRomCurve3([
  b2t(0, -24, 1.9),
  b2t(0.4, -14, 1.9),
  b2t(1.8, -8.5, 1.9),
  b2t(3.7, -3.6, 1.75),
  b2t(3.0, -0.25, 1.6),
], false, "centripetal");
const lookPath = new THREE.CatmullRomCurve3([
  b2t(0, 0, 4.6),
  b2t(0, 0, 4.0),
  b2t(0.3, 0.3, 2.7),
  b2t(0.9, 0.9, 1.75),
  b2t(1.0, 1.2, 1.5),
], false, "centripetal");

const ease = (t) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(Math.max(t, 0), 1));

function setCamera(p, time) {
  const e = ease(p);
  camera.position.copy(camPath.getPointAt(e));
  const look = lookPath.getPointAt(e);
  // respiração leve de câmera na mão
  camera.position.y += Math.sin(time * 0.8) * 0.03;
  camera.lookAt(look);
  camera.fov = 50 - 14 * e;
  camera.updateProjectionMatrix();
}

function frame(reveal, progress, time) {
  post.uniforms.uReveal.value = reveal;
  leafMat.uniforms.uTime.value = time;
  setCamera(progress, time);
  renderer.setRenderTarget(rt);
  renderer.render(scene, camera);
  renderer.setRenderTarget(null);
  renderer.render(postScene, postCam);
}

// ------------------------------------------------------------------ carregar
const KIND = { Trunk: 0, Canopy: 1, BgTrees: 1, Ground: 2, Man: 3, Woman: 3, Lake: 4, Hills: 5 };
const ready = new GLTFLoader().loadAsync(new URL("./scene.glb", import.meta.url).href).then((gltf) => {
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    const col = o.geometry.getAttribute("color");
    const n = col.count;
    const rgb = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      rgb[i * 3] = col.getX(i); rgb[i * 3 + 1] = col.getY(i); rgb[i * 3 + 2] = col.getZ(i);
    }
    o.geometry.setAttribute("aCol", new THREE.BufferAttribute(rgb, 3));
    o.material = paintMaterial(KIND[o.name] ?? KIND[o.parent?.name] ?? 0);
  });
  scene.add(gltf.scene);
});

if (RECORD) {
  resize(Number(params.get("w") || 1280), Number(params.get("h") || 720));
  // linha do tempo do preview: 0–3s pinta a paisagem, 3–12s movimento (= scroll)
  window.renderAt = (t) => {
    const reveal = Math.min(Math.max((t - 0.2) / 3.0, 0), 1);
    const progress = (t - 3.0) / 9.0;
    frame(reveal, progress, t);
  };
  window.sceneReady = ready.then(() => true);
} else {
  const onResize = () => resize(window.innerWidth, window.innerHeight);
  window.addEventListener("resize", onResize);
  onResize();
  const t0 = performance.now();
  ready.then(() => {
    const loop = () => {
      const t = (performance.now() - t0) / 1000;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      frame(Math.min(t / 3.0, 1), progress, t);
      requestAnimationFrame(loop);
    };
    loop();
  });
}
