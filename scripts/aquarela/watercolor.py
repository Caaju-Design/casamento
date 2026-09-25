"""
Mini motor de aquarela pra gerar as ilustrações estáticas do site.

Ideia: cada ilustração é desenhada como formas simples (polígonos, elipses,
curvas) e cada forma vira uma "aguada" de pigmento transparente em cima do
papel branco. O pigmento é acumulado como absorbância (modelo subtrativo):
camadas sobrepostas escurecem e misturam como tinta de verdade, e o branco
do papel fica branco. A imagem final é exibida no site com
`mix-blend-mode: multiply`, então o branco some no fundo linho da página e
só a tinta aparece.

Efeitos por aguada:
  - borda irregular (a água não segue o lápis certinho),
  - pigmento acumulado na borda quando a aguada seca (anel mais escuro),
  - aguada desigual por dentro + granulação fina,
  - "molhado no molhado": borda esfumada, sem anel,
  - floração (backrun) opcional.
Linhas de nanquim/lápis finas e tremidas dão o acabamento.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HEX = {
    # paleta oficial (docs/design-system/tokens/primitivos.tokens.json)
    "amarelo": ["#f8e0b6", "#f6d293", "#f3c271", "#f0b354", "#b4863e", "#785a29", "#3c2d14"],
    "pessego": ["#f6d1b5", "#f3bb90", "#efa46d", "#ec8e4d", "#b16a39", "#764726", "#3b2313"],
    "terracota": ["#d5b6a9", "#c0927e", "#ac6f54", "#984b2c", "#723921", "#4c2616", "#26130b"],
    "caramelo": ["#e6cebf", "#d9b79f", "#cd9e80", "#c28661", "#916449", "#614431", "#302218"],
    "salvia": ["#e0ded0", "#d0cdba", "#c0bda3", "#b1ac8c", "#848169", "#585646", "#2d2b23"],
    "linho": ["#f5f2ed", "#f0ebe3", "#ece5da", "#e6ded1", "#ada79c", "#736f69", "#3a3834"],
    "ardosia": ["#c4d1da", "#a8bac7", "#8ba4b4", "#6e8da2", "#536a79", "#374651", "#1b2428"],
}
STEPS = [50, 100, 200, 500, 700, 800, 900]


def color(family: str, step: int = 500) -> np.ndarray:
    h = HEX[family][STEPS.index(step)].lstrip("#")
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)])


def _noise(shape, scale, octaves, rng):
    h, w = shape
    out = np.zeros(shape)
    amp = tot = 0.0
    a = 1.0
    for o in range(octaves):
        s = max(2, int(scale * 2 ** o))
        small = rng.random((s, s))
        big = np.array(Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)) / 255.0
        out += big * a
        tot += a
        a *= 0.5
    return out / tot


@dataclass
class Painting:
    width: int = 1200
    height: int = 1200
    seed: int = 1
    absorb: np.ndarray = field(init=False)

    def __post_init__(self):
        self.rng = np.random.default_rng(self.seed)
        self.absorb = np.zeros((self.height, self.width, 3))
        self.grain = _noise((self.height, self.width), 90, 2, self.rng)
        self.paper = _noise((self.height, self.width), 40, 3, self.rng)

    # ------------------------------------------------------------ máscaras
    def canvas(self):
        img = Image.new("L", (self.width * 2, self.height * 2), 0)
        return img, ImageDraw.Draw(img)

    def to_mask(self, img: Image.Image) -> np.ndarray:
        return np.array(img.resize((self.width, self.height), Image.LANCZOS)) / 255.0

    @staticmethod
    def S(pts):
        """Coordenadas em 'unidades de ilustração' (0–1200) → canvas 2×."""
        return [(x * 2, y * 2) for x, y in pts]

    def poly(self, pts):
        img, d = self.canvas()
        d.polygon(self.S(pts), fill=255)
        return self.to_mask(img)

    def ellipse(self, cx, cy, rx, ry):
        img, d = self.canvas()
        d.ellipse([(cx - rx) * 2, (cy - ry) * 2, (cx + rx) * 2, (cy + ry) * 2], fill=255)
        return self.to_mask(img)

    def rrect(self, x0, y0, x1, y1, r):
        img, d = self.canvas()
        d.rounded_rectangle([x0 * 2, y0 * 2, x1 * 2, y1 * 2], radius=r * 2, fill=255)
        return self.to_mask(img)

    def stroke_mask(self, pts, width):
        img, d = self.canvas()
        d.line(self.S(pts), fill=255, width=int(width * 2), joint="curve")
        for x, y in pts[:1] + pts[-1:]:
            d.ellipse([(x - width / 2) * 2, (y - width / 2) * 2, (x + width / 2) * 2, (y + width / 2) * 2], fill=255)
        return self.to_mask(img)

    # --------------------------------------------------------------- aguadas
    def _warp(self, m, amp, scale):
        h, w = m.shape
        nx = _noise((h, w), scale, 3, self.rng) - 0.5
        ny = _noise((h, w), scale, 3, self.rng) - 0.5
        yy, xx = np.mgrid[0:h, 0:w].astype(float)
        return ndimage.map_coordinates(m, [yy + ny * amp, xx + nx * amp], order=1, mode="constant")

    def wash(self, mask, rgb, strength=1.0, wet=False, edge=0.55, bloom=False, unevenness=0.35,
             warp=10, granulate=0.35):
        m = self._warp(mask, warp, 7) if warp else mask
        if wet:
            m = ndimage.gaussian_filter(m, 5)
            m = np.clip(m * 1.15, 0, 1)
        else:
            m = ndimage.gaussian_filter(m, 0.8)
        hard = (m > 0.5).astype(float)
        dens = m * (1 - unevenness / 2 + unevenness * _noise(m.shape, 3, 4, self.rng))
        if not wet and edge:
            inner = ndimage.gaussian_filter(hard, 3.5)
            ring = np.clip(hard - inner, 0, 1) * 1.8
            dens += ring * edge * m
        if bloom:
            b = _noise(m.shape, 4, 3, self.rng)
            th = np.quantile(b[hard > 0], 0.72) if hard.sum() else 1
            bi = ndimage.gaussian_filter((b > th).astype(float), 1.5) * hard
            be = np.clip(bi * (1 - bi) * 4, 0, 1)
            dens = dens * (1 - 0.35 * bi) + 0.4 * be * m
        dens *= 1 - granulate / 2 + granulate * (0.6 * self.grain + 0.4 * self.paper)
        a = -np.log(np.clip(rgb, 0.02, 1.0))
        self.absorb += dens[..., None] * strength * a[None, None, :]

    def line(self, pts, rgb, width=3.0, strength=0.9, wobble=1.6):
        """Linha de nanquim tremida (pontos em unidades da ilustração)."""
        pts = [(x + self.rng.normal(0, wobble), y + self.rng.normal(0, wobble)) for x, y in pts]
        m = self.stroke_mask(pts, width)
        m = ndimage.gaussian_filter(m, 0.6)
        m *= 0.75 + 0.35 * self.grain
        a = -np.log(np.clip(rgb, 0.02, 1.0))
        self.absorb += m[..., None] * strength * a[None, None, :]

    def dashes(self, pts, rgb, dash=14, gap=12, width=3.0, strength=0.8):
        """Linha tracejada ao longo de uma polilinha (rota de viagem)."""
        seg = []
        acc = 0.0
        on = True
        out = []
        for (x0, y0), (x1, y1) in zip(pts[:-1], pts[1:]):
            L = math.hypot(x1 - x0, y1 - y0)
            n = max(1, int(L / 2))
            for k in range(n):
                t = k / n
                p = (x0 + (x1 - x0) * t, y0 + (y1 - y0) * t)
                if on:
                    seg.append(p)
                acc += L / n
                if on and acc >= dash:
                    out.append(seg)
                    seg, acc, on = [], 0.0, False
                elif not on and acc >= gap:
                    acc, on = 0.0, True
        if seg:
            out.append(seg)
        for s in out:
            if len(s) >= 2:
                self.line(s, rgb, width=width, strength=strength, wobble=0.4)

    def splatter(self, cx, cy, radius, rgb, n=26, size=(2, 7), strength=0.8):
        for _ in range(n):
            ang = self.rng.uniform(0, math.tau)
            r = abs(self.rng.normal(0, radius))
            s = self.rng.uniform(*size)
            m = self.ellipse(cx + math.cos(ang) * r, cy + math.sin(ang) * r, s, s * self.rng.uniform(0.7, 1.2))
            self.wash(m, rgb, strength, warp=2, edge=0.3, granulate=0.1)

    # ----------------------------------------------------------------- saída
    def save(self, path, size=900):
        rgb = np.exp(-self.absorb)
        # vinheta: o papel fica branco puro nas bordas (some no multiply)
        img = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8), "RGB")
        img = img.resize((size, int(size * self.height / self.width)), Image.LANCZOS)
        img.save(path, "WEBP", quality=86, method=6)
        return img


def bezier(p0, p1, p2, p3, n=60):
    out = []
    for k in range(n + 1):
        t = k / n
        u = 1 - t
        out.append((
            u ** 3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t ** 3 * p3[0],
            u ** 3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t ** 3 * p3[1],
        ))
    return out


def heart(cx, cy, s, n=80):
    pts = []
    for k in range(n):
        t = k / n * math.tau
        x = 16 * math.sin(t) ** 3
        y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * s / 16, cy - y * s / 16))
    return pts
