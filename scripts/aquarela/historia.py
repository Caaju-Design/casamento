"""
Ilustrações em aquarela da seção "Nossa história" (uma por momento).

Rodar:  python3 scripts/aquarela/historia.py
Saída:  public/historia/*.webp (fundo branco — no site vão com
        mix-blend-mode: multiply, então o branco vira o papel da página).
"""
import math
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
from watercolor import Painting, bezier, color, heart  # noqa: E402

OUT = Path(__file__).resolve().parents[2] / "public" / "historia"
W, H = 1200, 900
INK = color("caramelo", 800)


def rot(pts, cx, cy, ang, sc=1.0):
    c, s = math.cos(ang), math.sin(ang)
    return [(cx + (x * c - y * s) * sc, cy + (x * s + y * c) * sc) for x, y in pts]


PLANE = {
    "body": [(-42, -5), (28, -6), (44, 0), (28, 6), (-42, 5)],
    "wing_a": [(4, -5), (-14, -42), (-4, -42), (18, -5)],
    "wing_b": [(4, 5), (-14, 42), (-4, 42), (18, 5)],
    "tail_a": [(-36, -4), (-48, -20), (-40, -20), (-28, -4)],
    "tail_b": [(-36, 4), (-48, 20), (-40, 20), (-28, 4)],
}


def plane(p, cx, cy, ang, sc, rgb):
    for part in PLANE.values():
        p.wash(p.poly(rot(part, cx, cy, ang, sc)), rgb, 1.1, warp=2, edge=0.4, granulate=0.15)


def ridge(p, pts, step=10, amp=7):
    """Subdivide as arestas e tremula o contorno (encosta de montanha, não régua)."""
    out = []
    for (x0, y0), (x1, y1) in zip(pts, pts[1:] + pts[:1]):
        L = math.hypot(x1 - x0, y1 - y0)
        n = max(1, int(L / step))
        nx, ny = -(y1 - y0) / (L or 1), (x1 - x0) / (L or 1)
        off = 0.0
        for k in range(n):
            t = k / n
            off = 0.6 * off + 0.4 * p.rng.normal(0, amp)
            out.append((x0 + (x1 - x0) * t + nx * off, y0 + (y1 - y0) * t + ny * off))
    return out


def blob(p, cx, cy, rx, ry, lobes=5):
    """Mancha orgânica: raio que ondula em volta do centro."""
    ph = [p.rng.uniform(0, math.tau) for _ in range(3)]
    amp = [p.rng.uniform(0.06, 0.12), p.rng.uniform(0.03, 0.07), p.rng.uniform(0.02, 0.04)]
    pts = []
    for k in range(120):
        t = k / 120 * math.tau
        r = 1 + amp[0] * math.sin(2 * t + ph[0]) + amp[1] * math.sin(lobes * t + ph[1]) + amp[2] * math.sin(9 * t + ph[2])
        pts.append((cx + rx * r * math.cos(t), cy + ry * r * math.sin(t)))
    return p.poly(pts)


def backdrop(p, cx, cy, rx, ry, fam="linho", step=500, strength=0.45):
    """Duas aguadas de fundo sobrepostas, bem claras, que 'seguram' a vinheta."""
    p.wash(blob(p, cx, cy, rx, ry), color(fam, step), strength * 0.7, wet=True, warp=70, unevenness=0.7)
    p.wash(blob(p, cx + rx * 0.12, cy - ry * 0.08, rx * 0.8, ry * 0.85, 4), color(fam, step), strength * 0.5,
           wet=False, edge=0.35, warp=50, unevenness=0.7)


# ------------------------------------------------------------------ 1 · Cape Town
def cape_town():
    p = Painting(W, H, seed=11)
    backdrop(p, 600, 470, 520, 330, "ardosia", 50, 0.55)
    p.wash(p.ellipse(860, 300, 130, 130), color("pessego", 200), 0.7, wet=True, warp=25)
    # Devil's Peak, Table Mountain (topo reto), Lion's Head
    p.wash(p.poly(ridge(p, [(110, 650), (190, 505), (240, 470), (290, 520), (330, 650)])), color("ardosia", 700), 0.55, bloom=True)
    p.wash(p.poly(ridge(p, [(200, 660), (275, 540), (340, 470), (385, 425), (600, 421), (820, 418), (870, 450), (930, 520), (990, 600), (1030, 660)], amp=5)),
           color("ardosia", 500), 0.95, bloom=True)
    p.wash(p.poly(ridge(p, [(900, 665), (975, 540), (1015, 470), (1045, 452), (1075, 480), (1110, 560), (1150, 665)])), color("salvia", 700), 0.8)
    p.line([(386, 426), (500, 421), (650, 419), (818, 419)], INK, 2.4, 0.55)
    # cidade/encosta e mar
    p.wash(p.poly([(90, 700), (200, 640), (420, 655), (700, 640), (1000, 650), (1160, 690), (1150, 730), (100, 735)]), color("salvia", 200), 0.9, wet=True)
    p.wash(p.poly([(80, 735), (1170, 725), (1120, 800), (140, 805)]), color("ardosia", 100), 0.9, wet=True, warp=30)
    for y, x0, x1 in [(760, 300, 380), (772, 620, 720), (785, 860, 930), (768, 470, 520)]:
        p.line([(x0, y), ((x0 + x1) / 2, y - 4), (x1, y)], color("ardosia", 700), 2.0, 0.5)
    # desencontro: um vai embora, o outro chega — as rotas se cruzam sem se encontrar
    out = bezier((560, 400), (480, 230), (300, 190), (150, 150))
    inn = bezier((1120, 110), (960, 130), (760, 240), (640, 380))
    p.dashes(out, color("caramelo", 700), width=2.6)
    p.dashes(inn, color("caramelo", 700), width=2.6)
    plane(p, 150, 150, math.radians(200), 1.05, color("terracota", 500))
    plane(p, 1120, 110, math.radians(165), 1.05, color("terracota", 500))
    return p


# ------------------------------------------------------ 2 · grupo no Instagram
def grupo():
    p = Painting(W, H, seed=22)
    backdrop(p, 600, 470, 470, 350, "pessego", 50, 0.5)
    # celular
    p.wash(p.rrect(430, 120, 770, 800, 48), color("linho", 500), 0.9, edge=0.7)
    p.wash(p.rrect(455, 175, 745, 745, 18), color("linho", 50), 0.8, wet=False, edge=0.3)
    p.line([(478, 120), (722, 120)], INK, 2.5, 0.35)
    for pts in ([(430, 170), (430, 750)], [(770, 170), (770, 750)]):
        p.line(pts, INK, 2.4, 0.45)
    p.wash(p.rrect(560, 140, 640, 152, 6), color("caramelo", 700), 0.9, warp=1)
    # balões de conversa (três pessoas no grupo)
    bubbles = [(475, 215, 650, 290, "salvia", 200, "l"), (560, 320, 725, 395, "pessego", 200, "r"),
               (475, 425, 690, 500, "ardosia", 100, "l"), (575, 530, 725, 600, "pessego", 200, "r"),
               (475, 630, 640, 700, "salvia", 200, "l")]
    for x0, y0, x1, y1, fam, st, side in bubbles:
        p.wash(p.rrect(x0, y0, x1, y1, 30), color(fam, st), 1.0, edge=0.6, warp=5)
        tx = x0 + 18 if side == "l" else x1 - 18
        p.wash(p.poly([(tx - 10, y1 - 8), (tx + 10, y1 - 8), (tx - (14 if side == "l" else -14), y1 + 16)]), color(fam, st), 1.0, warp=3)
        for k in range(2 if y1 - y0 > 60 else 1):
            yy = y0 + 25 + k * 22
            p.line([(x0 + 24, yy), (x1 - 40 - k * 30, yy)], color(fam, 700), 2.2, 0.55, wobble=0.8)
    # a flecha do cupido atravessando o grupo, com coração
    arrow = [(250, 690), (430, 560), (770, 330), (930, 220)]
    p.line(arrow, color("terracota", 700), 3.2, 0.95, wobble=0.6)
    p.wash(p.poly([(945, 208), (905, 212), (922, 245)]), color("terracota", 700), 1.2, warp=2)
    for k in range(3):
        bx, by = 262 + k * 16, 682 - k * 11
        p.line([(bx, by), (bx - 26, by - 6)], color("terracota", 500), 2.2, 0.8)
        p.line([(bx, by), (bx - 6, by + 24)], color("terracota", 500), 2.2, 0.8)
    p.wash(p.poly(heart(955, 150, 55)), color("terracota", 500), 1.1, bloom=True)
    p.wash(p.poly(heart(870, 110, 22)), color("pessego", 500), 1.0)
    p.splatter(980, 240, 70, color("pessego", 500), n=14)
    return p


# ------------------------------------------------------- 3 · café e forró
def cafe():
    p = Painting(W, H, seed=33)
    backdrop(p, 600, 500, 500, 320, "amarelo", 50, 0.55)
    # mesinha
    p.wash(p.ellipse(600, 720, 420, 70), color("caramelo", 100), 0.9, wet=True, warp=25)

    def cup(cx, fam):
        p.wash(p.ellipse(cx, 710, 150, 34), color("linho", 500), 1.0, edge=0.6)          # pires
        p.wash(p.poly([(cx - 105, 520), (cx + 105, 520), (cx + 88, 660), (cx + 60, 700), (cx - 60, 700), (cx - 88, 660)]),
               color(fam, 200), 1.0, bloom=True)
        p.wash(p.ellipse(cx, 520, 105, 24), color("caramelo", 700), 0.95, edge=0.5)       # café
        p.line([(cx - 105, 520), (cx - 88, 660), (cx - 60, 700), (cx + 60, 700), (cx + 88, 660), (cx + 105, 520)], INK, 2.4, 0.5)
        handle = bezier((cx + 98, 560), (cx + 175, 555), (cx + 170, 650), (cx + 82, 645))
        p.wash(p.stroke_mask(handle, 16), color(fam, 500), 1.0, warp=2, edge=0.5)

    cup(410, "pessego")
    cup(800, "salvia")
    # vapor dos dois cafés se encontrando num coração
    p.line(bezier((400, 490), (330, 400), (470, 360), (560, 300)), color("caramelo", 500), 3, 0.7)
    p.line(bezier((810, 490), (880, 400), (730, 360), (640, 300)), color("caramelo", 500), 3, 0.7)
    p.wash(p.poly(heart(600, 245, 70)), color("terracota", 500), 1.0, bloom=True)
    # o forró: notinhas musicais
    for x, y, s in [(250, 300, 1.0), (960, 260, 1.1), (1030, 380, 0.8), (180, 420, 0.8)]:
        p.wash(p.ellipse(x, y + 60 * s, 17 * s, 13 * s), color("ardosia", 700), 1.2, warp=2)
        p.line([(x + 15 * s, y + 58 * s), (x + 15 * s, y)], color("ardosia", 700), 3, 0.9, wobble=0.4)
        p.line(bezier((x + 15 * s, y), (x + 40 * s, y + 10 * s), (x + 45 * s, y + 25 * s), (x + 35 * s, y + 40 * s)), color("ardosia", 700), 3, 0.8)
    return p


# ------------------------------------------------------- 4 · viagens e saudade
def viagens():
    p = Painting(W, H, seed=44)
    backdrop(p, 600, 480, 520, 330, "ardosia", 50, 0.55)
    # dois pontos no mapa ligados por um arco de voo
    arc = bezier((250, 560), (330, 180), (870, 160), (960, 520))
    p.dashes(arc, color("caramelo", 700), width=3)
    for x, fam in [(250, "terracota"), (960, "salvia")]:
        pin = [(x, 600)] + [(x + 45 * math.sin(t), 520 - 45 * math.cos(t)) for t in np.linspace(-2.3, 2.3, 40)]
        p.wash(p.poly(pin), color(fam, 500), 1.05, bloom=True)
        p.wash(p.ellipse(x, 520, 16, 16), color("linho", 50), 0.2, warp=1)
    plane(p, 600, 205, math.radians(-2), 1.2, color("terracota", 500))
    # mala de viagem com etiqueta de coração
    p.wash(p.rrect(470, 520, 750, 760, 26), color("pessego", 500), 1.0, bloom=True)
    p.wash(p.rrect(470, 520, 750, 760, 26), color("pessego", 200), 0.4, wet=True)
    for x in (540, 680):
        p.wash(p.rrect(x - 10, 520, x + 10, 760, 4), color("caramelo", 700), 0.9, warp=2)
    p.line([(560, 520), (560, 470), (660, 470), (660, 520)], INK, 7, 0.8)
    for x in (505, 715):
        p.wash(p.ellipse(x, 772, 14, 14), color("caramelo", 800), 1.1, warp=1)
    p.line([(750, 560), (800, 610)], INK, 2, 0.6)
    p.wash(p.poly(heart(820, 640, 42)), color("terracota", 500), 1.1)
    # corações pequenos da saudade saindo dos pinos
    for x, y, s in [(300, 420, 16), (905, 400, 18), (360, 350, 11)]:
        p.wash(p.poly(heart(x, y, s)), color("pessego", 500), 1.0, warp=2)
    return p


# ------------------------------------------------------- 5 · o mesmo endereço
def endereco():
    p = Painting(W, H, seed=55)
    backdrop(p, 600, 480, 500, 330, "salvia", 50, 0.55)
    p.wash(p.ellipse(600, 740, 430, 60), color("salvia", 200), 0.9, wet=True, warp=30)
    # casinha
    p.wash(p.poly([(400, 450), (800, 450), (800, 730), (400, 730)]), color("linho", 500), 1.0, edge=0.7)
    p.wash(p.poly([(360, 470), (600, 250), (840, 470)]), color("terracota", 500), 1.0, bloom=True)
    p.wash(p.rrect(690, 270, 740, 380, 4), color("terracota", 700), 1.0)                # chaminé
    p.wash(p.rrect(545, 580, 655, 730, 50), color("salvia", 700), 1.0)                  # porta
    p.wash(p.ellipse(632, 660, 6, 6), color("amarelo", 700), 1.2, warp=1)
    p.wash(p.poly(heart(600, 400, 40)), color("pessego", 500), 1.1)                     # janela de coração
    p.line([(400, 450), (400, 730), (800, 730), (800, 450)], INK, 2.4, 0.5)
    p.line([(360, 470), (600, 250), (840, 470)], INK, 2.6, 0.55)
    for x in (445, 755):
        p.wash(p.rrect(x - 42, 500, x + 42, 590, 6), color("ardosia", 100), 1.0)
        p.line([(x, 500), (x, 590)], INK, 2, 0.5)
        p.line([(x - 42, 545), (x + 42, 545)], INK, 2, 0.5)
    # fumacinha em coração
    p.line(bezier((715, 262), (680, 200), (760, 180), (730, 120)), color("linho", 700), 3, 0.7)
    p.wash(p.poly(heart(740, 95, 26)), color("terracota", 200), 1.0, warp=2)
    # dois passarinhos voando juntos (o "nós")
    for x, y, sc in [(470, 190, 1.0), (535, 165, 0.8)]:
        p.line(bezier((x - 30 * sc, y), (x - 18 * sc, y - 16 * sc), (x - 6 * sc, y - 10 * sc), (x, y)), color("ardosia", 700), 3.2, 0.9, wobble=0.3)
        p.line(bezier((x, y), (x + 6 * sc, y - 10 * sc), (x + 18 * sc, y - 16 * sc), (x + 30 * sc, y)), color("ardosia", 700), 3.2, 0.9, wobble=0.3)
    # flores no jardim
    for x in (330, 380, 850, 900, 880):
        p.line([(x, 740), (x + 3, 690)], color("salvia", 800), 2.5, 0.8)
        p.wash(p.ellipse(x + 3, 682, 14, 14), color("pessego" if x % 20 else "amarelo", 500), 1.0, warp=3)
    return p


# ------------------------------------------------------- 6 · celebrar juntos
def celebrar():
    p = Painting(W, H, seed=66)
    backdrop(p, 600, 470, 500, 340, "amarelo", 50, 0.6)

    def glass(cx, ang):
        bowl = [(-70, -230), (70, -230), (60, -120), (30, -60), (8, -45), (-8, -45), (-30, -60), (-60, -120)]
        stem = [(-6, -45), (6, -45), (6, 110), (-6, 110)]
        foot = [(-70, 110), (70, 110), (60, 128), (-60, 128)]
        wine = [(-64, -175), (64, -175), (58, -120), (30, -62), (-30, -62), (-58, -120)]
        c, base = cx, 650
        p.wash(p.poly(rot(wine, c, base, ang)), color("amarelo", 500), 1.0, bloom=True)
        for part in (bowl, stem, foot):
            p.wash(p.poly(rot(part, c, base, ang)), color("linho", 500), 0.45, edge=0.8, warp=4)
        outline = [(-70, -230), (-60, -120), (-30, -60), (-8, -45), (-6, 110), (-70, 110), (70, 110), (6, 110), (8, -45), (30, -60), (60, -120), (70, -230)]
        p.line(rot(outline, c, base, ang), INK, 2.4, 0.55)
        for k in range(6):
            bx, by = rot([(p.rng.uniform(-40, 40), p.rng.uniform(-165, -80))], c, base, ang)[0]
            p.wash(p.ellipse(bx, by, 5, 5), color("linho", 50), 0.0)
            p.line([(bx - 3, by), (bx + 3, by)], color("amarelo", 700), 3, 0.5, wobble=0.2)

    glass(505, math.radians(12))
    glass(695, math.radians(-12))
    # brilho do brinde
    for a in range(0, 360, 45):
        r0, r1 = 40, 80 if a % 90 == 0 else 62
        t = math.radians(a)
        p.line([(600 + r0 * math.cos(t), 390 + r0 * math.sin(t)), (600 + r1 * math.cos(t), 390 + r1 * math.sin(t))],
               color("amarelo", 700), 3.2, 0.8, wobble=0.3)
    # confete nas cores da paleta
    for fam in ("terracota", "pessego", "salvia", "ardosia", "amarelo"):
        p.splatter(600, 300, 260, color(fam, 500), n=10, size=(5, 11), strength=0.9)
    p.wash(p.poly(heart(600, 220, 34)), color("terracota", 500), 1.1)
    return p


SCENES = {
    "01-cape-town": cape_town,
    "02-grupo": grupo,
    "03-cafe-e-forro": cafe,
    "04-viagens": viagens,
    "05-mesmo-endereco": endereco,
    "06-celebrar": celebrar,
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    only = sys.argv[1:] or list(SCENES)
    for name in only:
        SCENES[name]().save(OUT / f"{name}.webp", size=960)
        print("ok", name)


def reveal_sprite(path, frames=10, w=480, h=360):
    """
    Máscara de "tinta se espalhando" usada pra revelar cada ilustração quando
    ela entra na tela: 10 quadros empilhados na vertical (sprite), do papel
    vazio (quadro 1) à mancha cobrindo tudo (quadro 10). O CSS anda pelos
    quadros com `steps()`, então não custa nada de processamento no celular.
    """
    from PIL import Image
    from watercolor import _noise

    rng = np.random.default_rng(7)
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.hypot((xx - w * 0.5) / (w * 0.5), (yy - h * 0.52) / (h * 0.5))
    order = r * 0.62 + _noise((h, w), 3, 4, rng) * 0.55 + _noise((h, w), 12, 2, rng) * 0.12
    order = (order - order.min()) / (order.max() - order.min())
    sheet = np.zeros((h * frames, w, 4), dtype=np.uint8)
    for k in range(frames):
        t = k / (frames - 1) * 1.12
        a = np.clip((t - order) / 0.06, 0, 1)
        if k == frames - 1:
            a[:] = 1.0
        sheet[k * h:(k + 1) * h, :, :3] = 255
        sheet[k * h:(k + 1) * h, :, 3] = (a * 255).astype(np.uint8)
    Image.fromarray(sheet, "RGBA").save(path, optimize=True)


if __name__ == "__main__":
    reveal_sprite(OUT / "revelar.png")
    print("ok revelar.png")
