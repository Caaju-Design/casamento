"""
Gera o atlas de folhas de bordo em aquarela usado pelas folhas que caem no
hero (public/hero/leaves/maple-atlas.png): 2×2 folhas de 256px, cada uma com
cor, formato e "manchas" próprias.

Rodar:  python3 scripts/generate-maple-leaves.py

O visual imita pigmento transparente no papel:
 - tinta mais densa na borda (a água seca e deixa o anel escuro),
 - aguada irregular por dentro (ruído de baixa frequência),
 - granulação fina,
 - nervuras "levantadas" (mais claras, como pincel seco tirando tinta),
 - uma floração (backrun) numa parte das folhas,
 - gradiente de cor típico do bordo no outono (miolo mais quente/amarelado,
   pontas mais vermelhas).
A cor final fica em RGB e a "quantidade de tinta" no alfa — assim a folha
é mais transparente onde a aguada é fina, como aquarela de verdade.
"""
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

SIZE = 256
SS = 4  # supersampling do contorno
OUT = Path(__file__).resolve().parent.parent / "public" / "hero" / "leaves" / "maple-atlas.png"

rng = np.random.default_rng(1704)


def fbm(shape, scale, octaves=4, seed=0):
    r = np.random.default_rng(seed)
    h, w = shape
    out = np.zeros(shape)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        s = max(2, int(scale * 2**o))
        small = r.random((s, s))
        big = np.array(Image.fromarray((small * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)) / 255.0
        out += big * amp
        tot += amp
        amp *= 0.5
    return out / tot


def maple_outline(seed):
    """Contorno de folha de bordo: 5 lóbulos serrilhados + cabinho."""
    r = np.random.default_rng(seed)
    # (ângulo a partir de "pra cima", comprimento, meia-largura em graus)
    lobes = [
        (0, 1.0, 36),
        (-62, 0.9, 32), (62, 0.9, 32),
        (-122, 0.58, 26), (122, 0.58, 26),
    ]
    lobes = [(a + r.uniform(-5, 5), L * r.uniform(0.93, 1.05), w) for a, L, w in lobes]
    pts = []
    n = 900
    for k in range(n):
        th = -180 + 360 * k / n
        rad = 0.28
        for a, L, w in lobes:
            d = abs((th - a + 180) % 360 - 180)
            if d < w * 1.6:
                # lóbulo largo com ombros (bordo-açucareiro), afinando na ponta
                prof = max(0.0, 1 - (d / w) ** 2.2) ** 0.8
                # pontas secundárias: 2 "ombros" pontudos de cada lado do lóbulo
                teeth = 0.16 * L * max(0.0, math.sin(d / w * math.pi * 1.5)) ** 6
                teeth += 0.04 * L * max(0.0, math.sin(d / w * math.pi * 4.5)) ** 4
                tip = 0.1 * L * max(0.0, 1 - d / (w * 0.18))
                rad = max(rad, 0.28 + (L - 0.28) * prof * 0.88 + teeth * (d < w) + tip)
        # ponta aguda no fim de cada lóbulo
        pts.append((th, rad))
    xy = []
    for th, rad in pts:
        t = math.radians(th)
        xy.append((math.sin(t) * rad, -math.cos(t) * rad))
    return np.array(xy), lobes


def render_leaf(seed, base, tip):
    S = SIZE * SS
    xy, lobes = maple_outline(seed)
    # centro um pouco abaixo do meio pra caber o lóbulo de cima inteiro
    cx, cy, sc = S * 0.5, S * 0.55, S * 0.42
    poly = [(cx + x * sc, cy + y * sc) for x, y in xy]
    img = Image.new("L", (S, S), 0)
    d = ImageDraw.Draw(img)
    d.polygon(poly, fill=255)
    # cabinho
    d.line([(cx, cy), (cx + S * 0.015, cy + S * 0.3)], fill=255, width=int(S * 0.012))
    mask = np.array(img.resize((SIZE, SIZE), Image.LANCZOS)) / 255.0

    # borda irregular (papel absorvendo): deforma a máscara com ruído
    n1 = fbm((SIZE, SIZE), 6, 3, seed + 1)
    mask = np.clip((mask - 0.5) * 3 + 0.5 + (n1 - 0.5) * 0.9, 0, 1)
    mask = ndimage.gaussian_filter(mask, 0.6)

    inside = mask > 0.5
    dist = ndimage.distance_transform_edt(inside)
    edge = np.exp(-dist / 3.2) * inside  # anel de pigmento na borda

    # densidade da tinta
    wash = fbm((SIZE, SIZE), 3, 4, seed + 2)
    grain = fbm((SIZE, SIZE), 48, 2, seed + 3)
    dens = 0.75 + 0.35 * wash + 0.5 * edge
    dens *= 0.85 + 0.3 * grain

    # nervuras levantadas: do centro pra ponta de cada lóbulo
    veins = Image.new("L", (SIZE, SIZE), 0)
    dv = ImageDraw.Draw(veins)
    c0 = (SIZE * 0.5, SIZE * 0.56)
    for a, L, w in lobes:
        t = math.radians(a)
        p1 = (c0[0] + math.sin(t) * L * SIZE * 0.40, c0[1] - math.cos(t) * L * SIZE * 0.40)
        dv.line([c0, p1], fill=255, width=2)
    vmask = ndimage.gaussian_filter(np.array(veins) / 255.0, 1.0)
    dens *= 1 - 0.3 * np.clip(vmask * 2, 0, 1)

    # floração (backrun) em algumas folhas
    if rng.random() < 0.7:
        bl = fbm((SIZE, SIZE), 4, 3, seed + 4)
        th = np.quantile(bl[inside], 0.75)
        bloom_in = ndimage.gaussian_filter((bl > th).astype(float), 1.2)
        bloom_edge = np.clip(bloom_in * (1 - bloom_in) * 4, 0, 1)
        dens = dens * (1 - 0.3 * bloom_in) + 0.35 * bloom_edge

    # gradiente de cor: miolo quente/claro, pontas mais vermelhas
    yy, xx = np.mgrid[0:SIZE, 0:SIZE]
    rr = np.hypot(xx - c0[0], yy - c0[1]) / (SIZE * 0.42)
    tcol = np.clip(rr * 0.9 + (fbm((SIZE, SIZE), 4, 3, seed + 5) - 0.5) * 0.6, 0, 1)[..., None]
    col = np.array(base)[None, None, :] * (1 - tcol) + np.array(tip)[None, None, :] * tcol

    # pigmento transparente: tinta fina clareia rumo ao branco
    dens = np.clip(dens, 0, 1.4)
    absorb = -np.log(np.clip(col, 0.03, 1))
    rgb = np.exp(-absorb * np.clip(dens, 0.4, 1.4)[..., None])
    alpha = np.clip(mask * (0.55 + 0.4 * np.clip(dens, 0, 1)), 0, 1)
    rgba = np.dstack([rgb, alpha])
    return (np.clip(rgba, 0, 1) * 255).astype(np.uint8)


LEAVES = [
    # (miolo, pontas) — tons quentes da paleta oficial do casamento
    ((0.941, 0.702, 0.329), (0.925, 0.557, 0.302)),  # amarelo.500 → pessego.500
    ((0.925, 0.557, 0.302), (0.596, 0.294, 0.173)),  # pessego.500 → terracota.500
    ((0.953, 0.761, 0.443), (0.694, 0.416, 0.224)),  # amarelo.200 → pessego.700
    ((0.761, 0.525, 0.380), (0.447, 0.224, 0.129)),  # caramelo.500 → terracota.700
]

atlas = np.zeros((SIZE * 2, SIZE * 2, 4), dtype=np.uint8)
for i, (base, tip) in enumerate(LEAVES):
    leaf = render_leaf(100 + i * 17, base, tip)
    y, x = (i // 2) * SIZE, (i % 2) * SIZE
    atlas[y:y + SIZE, x:x + SIZE] = leaf
OUT.parent.mkdir(parents=True, exist_ok=True)
Image.fromarray(atlas, "RGBA").save(OUT, optimize=True)
print("ok", OUT, OUT.stat().st_size)
