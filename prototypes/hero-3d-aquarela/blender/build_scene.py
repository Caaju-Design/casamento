"""
Cena do hero 3D do casamento Manu & Gabi — gerada 100% via script (Blender bpy).

Rodar:  blender --background --python build_scene.py -- <saida.glb>

Convenções:
- Blender é Z-up; o exportador glTF converte pra Y-up (x, y, z) -> (x, z, -y).
- A câmera começa em Blender (0, -30, 2) olhando pra +Y (árvore na origem).
- Cores ficam num atributo FLOAT_COLOR "Col" por vértice, em valores de
  "tela" (sRGB). O shader aquarela no Three.js trata como cor de display.
- Nomes dos objetos (Trunk, Canopy, Ground, ...) são usados pelo Three.js
  pra escolher o "tipo" de pincelada de cada material.
"""
import sys
import math
import random

import bmesh
import bpy
from mathutils import Matrix, Quaternion, Vector, noise

random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True)

OUT = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "/tmp/scene.glb"


def clamp01(x):
    return max(0.0, min(1.0, x))


def jitter_color(c, amt):
    k = 1.0 + random.uniform(-amt, amt)
    return tuple(clamp01(ch * k) for ch in c)


class MeshBuilder:
    """Acumula primitivas num único bmesh, com cor por vértice."""

    def __init__(self):
        self.bm = bmesh.new()
        self.col = self.bm.verts.layers.float_color.new("Col")

    def _paint(self, verts, color, noise_amt=0.0, noise_scale=1.0):
        for v in verts:
            c = color
            if noise_amt:
                n = noise.noise(v.co * noise_scale)
                c = tuple(clamp01(ch * (1.0 + noise_amt * n)) for ch in color)
            v[self.col] = (c[0], c[1], c[2], 1.0)

    def cyl(self, p0, p1, r0, r1, color, seg=10, noise_amt=0.0):
        p0, p1 = Vector(p0), Vector(p1)
        d = p1 - p0
        length = d.length
        res = bmesh.ops.create_cone(
            self.bm, cap_ends=True, cap_tris=False, segments=seg,
            radius1=r0, radius2=r1, depth=length,
        )
        rot = d.to_track_quat("Z", "Y").to_matrix().to_4x4()
        m = Matrix.Translation((p0 + p1) / 2) @ rot
        bmesh.ops.transform(self.bm, matrix=m, verts=res["verts"])
        self._paint(res["verts"], color, noise_amt, 2.0)
        return res["verts"]

    def ellipsoid(self, center, scale, color, rot_euler=None, subdiv=2,
                  displace=0.0, disp_scale=1.0, noise_amt=0.0):
        res = bmesh.ops.create_icosphere(self.bm, subdivisions=subdiv, radius=1.0)
        verts = res["verts"]
        seed_off = Vector((random.uniform(0, 50), random.uniform(0, 50), random.uniform(0, 50)))
        if displace:
            for v in verts:
                n = noise.noise(v.co * disp_scale + seed_off)
                v.co = v.co * (1.0 + displace * n)
        m = Matrix.Translation(Vector(center))
        if rot_euler is not None:
            m = m @ rot_euler.to_matrix().to_4x4()
        m = m @ Matrix.Diagonal(Vector((scale[0], scale[1], scale[2], 1.0)))
        bmesh.ops.transform(self.bm, matrix=m, verts=verts)
        self._paint(verts, color, noise_amt, 1.3)
        return verts

    def to_object(self, name, smooth=True):
        bmesh.ops.recalc_face_normals(self.bm, faces=self.bm.faces[:])
        mesh = bpy.data.meshes.new(name)
        self.bm.to_mesh(mesh)
        self.bm.free()
        # o exportador glTF só escreve COLOR_0 pro atributo marcado como "render color"
        idx = mesh.color_attributes.find("Col")
        mesh.color_attributes.render_color_index = idx
        mesh.color_attributes.active_color_index = idx
        if smooth:
            for p in mesh.polygons:
                p.use_smooth = True
        obj = bpy.data.objects.new(name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        return obj


# --------------------------------------------------------------------------
# Paletas (sRGB de tela)
# --------------------------------------------------------------------------
BARK = (0.42, 0.34, 0.31)
BARK_DARK = (0.30, 0.24, 0.22)
MAPLE = [
    (0.50, 0.05, 0.10),   # vinho
    (0.68, 0.07, 0.08),   # carmim
    (0.80, 0.13, 0.07),   # vermelho
    (0.88, 0.27, 0.08),   # vermelho-laranja
    (0.93, 0.45, 0.12),   # laranja
    (0.95, 0.63, 0.22),   # âmbar
]
GRASS = (0.60, 0.66, 0.36)
SKIN_M = (0.80, 0.60, 0.47)
SKIN_W = (0.88, 0.70, 0.58)
SHIRT = (0.95, 0.92, 0.86)
PANTS = (0.82, 0.76, 0.64)
DRESS = (0.98, 0.96, 0.92)
HAIR_M = (0.12, 0.08, 0.06)
HAIR_W = (0.36, 0.21, 0.11)


# --------------------------------------------------------------------------
# Árvore: tronco + galhos recursivos + copa em "manchas" de aquarela
# --------------------------------------------------------------------------
def build_tree():
    trunk = MeshBuilder()
    tips = []
    joints = []

    def branch(p, dirv, length, radius, depth):
        end = p + dirv * length
        r_end = radius * 0.66
        trunk.cyl(p, end, radius, r_end, BARK, seg=10, noise_amt=0.25)
        trunk.ellipsoid(end, (r_end * 1.05,) * 3, BARK, subdiv=1)
        joints.append((end.copy(), depth))
        if depth == 0:
            tips.append(end.copy())
            return
        n = 3 if depth >= 3 else random.choice([2, 3])
        base_az = random.uniform(0, math.tau)
        for i in range(n):
            ang = math.radians(random.uniform(28, 48))
            az = base_az + i * (math.tau / n) + random.uniform(-0.4, 0.4)
            perp = dirv.orthogonal().normalized()
            perp.rotate(Quaternion(dirv, az))
            nd = (dirv * math.cos(ang) + perp * math.sin(ang)).normalized()
            nd.z += 0.12
            nd.normalize()
            branch(end, nd, length * random.uniform(0.70, 0.82), r_end, depth - 1)

    # Base alargada + tronco com leve inclinação
    trunk.cyl((0, 0, -0.1), (0, 0, 0.45), 0.52, 0.30, BARK_DARK, seg=12, noise_amt=0.2)
    top = Vector((0.08, 0.05, 2.7))
    trunk.cyl((0, 0, 0.3), top, 0.30, 0.24, BARK, seg=12, noise_amt=0.2)
    trunk.ellipsoid(top, (0.25, 0.25, 0.25), BARK, subdiv=1)

    base_az = 0.3
    for i in range(3):
        az = base_az + i * math.tau / 3 + random.uniform(-0.2, 0.2)
        ang = math.radians(random.uniform(34, 46))
        d = Vector((math.sin(ang) * math.cos(az), math.sin(ang) * math.sin(az), math.cos(ang)))
        branch(top, d, 2.5, 0.2, 4)
    # Um líder central
    branch(top, Vector((0.05, 0.02, 1)).normalized(), 2.2, 0.18, 3)

    trunk_obj = trunk.to_object("Trunk")

    # Copa: manchas nas pontas + preenchimento dentro do volume da copa
    canopy = MeshBuilder()
    centers = []
    for t in tips:
        centers.append((t + Vector((0, 0, 0.35)), random.uniform(0.95, 1.35)))
    for j, depth in joints:
        if depth in (1, 2) and random.random() < 0.7:
            centers.append((j + Vector((0, 0, 0.5)), random.uniform(1.1, 1.6)))
    # preenchimento: pontos dentro de um elipsoide largo da copa
    crown_c = Vector((0, 0, 6.2))
    crown_r = Vector((4.6, 4.6, 2.7))
    for _ in range(40):
        while True:
            q = Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-1, 1)))
            if q.length <= 1:
                break
        c = crown_c + Vector((q.x * crown_r.x, q.y * crown_r.y, q.z * crown_r.z))
        centers.append((c, random.uniform(1.0, 1.5)))

    zs = [c.z for c, _ in centers]
    zmin, zmax = min(zs), max(zs)
    for c, r in centers:
        h = (c.z - zmin) / max(zmax - zmin, 1e-3)
        outer = min(1.0, Vector((c.x, c.y, 0)).length / 5.0)
        warm = clamp01(0.35 * h + 0.25 * outer + random.uniform(-0.3, 0.25))
        idx = min(len(MAPLE) - 1, int(warm * len(MAPLE)))
        col = jitter_color(MAPLE[idx], 0.08)
        canopy.ellipsoid(
            c, (r, r, r * 0.8), col, subdiv=3,
            displace=0.35, disp_scale=1.6, noise_amt=0.18,
        )
    canopy_obj = canopy.to_object("Canopy")
    return trunk_obj, canopy_obj


# --------------------------------------------------------------------------
# Terreno, lago, colinas e árvores de fundo
# --------------------------------------------------------------------------
LAKE_C = Vector((-24.0, 32.0))
LAKE_R = Vector((24.0, 9.0))
LAKE_ROT = math.radians(-18)


def lake_factor(x, y):
    """<1 dentro da elipse do lago."""
    dx, dy = x - LAKE_C.x, y - LAKE_C.y
    cs, sn = math.cos(LAKE_ROT), math.sin(LAKE_ROT)
    lx, ly = dx * cs - dy * sn, dx * sn + dy * cs
    return math.sqrt((lx / LAKE_R.x) ** 2 + (ly / LAKE_R.y) ** 2)


def smoothstep(a, b, x):
    t = clamp01((x - a) / (b - a))
    return t * t * (3 - 2 * t)


def build_ground():
    g = MeshBuilder()
    res = bmesh.ops.create_grid(g.bm, x_segments=160, y_segments=160, size=110)
    for v in res["verts"]:
        x, y = v.co.x, v.co.y
        r = math.hypot(x, y)
        h = noise.noise(Vector((x * 0.025, y * 0.025, 0.3))) * 1.6
        h += noise.noise(Vector((x * 0.08, y * 0.08, 5.0))) * 0.25
        h *= smoothstep(6, 30, r)
        h += smoothstep(60, 110, r) * 6.0
        lf = lake_factor(x, y)
        h = h * smoothstep(1.0, 1.6, lf) - 0.6 * (1 - smoothstep(0.85, 1.05, lf))
        v.co.z = h

        n = noise.noise(Vector((x * 0.12, y * 0.12, 1.7)))
        col = (
            GRASS[0] * (1 + 0.15 * n) + 0.05 * smoothstep(0.2, 0.8, n),
            GRASS[1] * (1 + 0.08 * n),
            GRASS[2] * (1 - 0.1 * n),
        )
        # folhas caídas sob a árvore
        leaf = (1 - smoothstep(2.0, 4.8, r + 1.2 * noise.noise(Vector((x * 0.6, y * 0.6, 9.0)))))
        col = tuple(col[i] * (1 - leaf) + (0.78, 0.36, 0.20)[i] * leaf for i in range(3))
        # margem do lago mais escura/verde
        shore = 1 - smoothstep(1.0, 1.5, lf)
        col = tuple(col[i] * (1 - shore * 0.5) + (0.40, 0.52, 0.30)[i] * shore * 0.5 for i in range(3))
        v[g.col] = (clamp01(col[0]), clamp01(col[1]), clamp01(col[2]), 1.0)
    ground = g.to_object("Ground")

    lake = MeshBuilder()
    res = bmesh.ops.create_circle(lake.bm, cap_ends=True, segments=48, radius=1.0)
    m = (Matrix.Translation((LAKE_C.x, LAKE_C.y, -0.12))
         @ Matrix.Rotation(-LAKE_ROT, 4, "Z")
         @ Matrix.Diagonal(Vector((LAKE_R.x * 1.02, LAKE_R.y * 1.02, 1, 1))))
    bmesh.ops.transform(lake.bm, matrix=m, verts=res["verts"])
    lake._paint(res["verts"], (0.62, 0.72, 0.78))
    lake_obj = lake.to_object("Lake", smooth=False)
    return ground, lake_obj


def build_hills():
    h = MeshBuilder()
    for i in range(22):
        ang = math.radians(-20 + i * (220 / 21) + random.uniform(-4, 4))  # arco à frente/esquerda
        dist = random.uniform(95, 150)
        c = Vector((math.cos(ang) * dist, math.sin(ang) * dist, -2.0))
        far = smoothstep(95, 150, dist)
        col = tuple(
            (0.44, 0.56, 0.40)[k] * (1 - far) + (0.52, 0.60, 0.62)[k] * far for k in range(3)
        )
        h.ellipsoid(
            c, (random.uniform(28, 45), random.uniform(18, 26), random.uniform(8, 16)),
            jitter_color(col, 0.06),
            rot_euler=__import__("mathutils").Euler((0, 0, ang + math.pi / 2)),
            subdiv=3, displace=0.08, disp_scale=2.0,
        )
    return h.to_object("Hills")


def build_bg_trees():
    b = MeshBuilder()
    greens = [(0.30, 0.44, 0.20), (0.38, 0.50, 0.24), (0.46, 0.56, 0.28), (0.34, 0.47, 0.30)]
    placed = 0
    tries = 0
    while placed < 26 and tries < 500:
        tries += 1
        ang = math.radians(random.uniform(-40, 220))
        dist = random.uniform(24, 80)
        x, y = math.cos(ang) * dist, math.sin(ang) * dist
        if lake_factor(x, y) < 1.3:
            continue
        # não bloquear o começo da câmera (corredor em -Y)
        if y < -8 and abs(x) < 20:
            continue
        s = random.uniform(0.7, 1.4)
        b.cyl((x, y, -0.2), (x, y, 2.2 * s), 0.18 * s, 0.12 * s, BARK_DARK, seg=6)
        col = random.choice(greens)
        if random.random() < 0.08:
            col = (0.78, 0.40, 0.16)
        for _ in range(random.randint(3, 5)):
            o = Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(0, 1.2))) * s
            r = random.uniform(1.1, 1.7) * s
            b.ellipsoid((x + o.x, y + o.y, 3.0 * s + o.z), (r, r, r * 0.85),
                        jitter_color(col, 0.1), subdiv=2, displace=0.3, disp_scale=1.5,
                        noise_amt=0.15)
        placed += 1
    return b.to_object("BgTrees")


# --------------------------------------------------------------------------
# Casal (estilizado) — cada pessoa construída em espaço local olhando pra +X
# --------------------------------------------------------------------------
def build_man(mb, M):
    def P(x, y, z):
        return M @ Vector((x, y, z))

    def ell(c, s, col, **kw):
        verts = mb.ellipsoid((0, 0, 0), s, col, **kw)
        bmesh.ops.transform(mb.bm, matrix=Matrix.Translation(P(*c)) @ M.to_3x3().to_4x4(), verts=verts)

    for sy in (-0.1, 0.1):
        mb.cyl(P(0, sy, 0.02), P(0, sy, 0.93), 0.08, 0.075, PANTS, seg=10)
        ell((0.05, sy, 0.04), (0.13, 0.06, 0.05), (0.30, 0.22, 0.16))
    ell((0, 0, 0.96), (0.14, 0.19, 0.12), PANTS)
    ell((0.01, 0, 1.2), (0.14, 0.21, 0.3), SHIRT)
    ell((0.01, 0, 1.41), (0.13, 0.245, 0.08), SHIRT)
    mb.cyl(P(0.02, 0, 1.44), P(0.05, 0, 1.56), 0.055, 0.05, SKIN_M, seg=10)
    ell((0.08, 0.02, 1.665), (0.105, 0.095, 0.12), SKIN_M,
        rot_euler=__import__("mathutils").Euler((0, math.radians(18), 0)))
    ell((0.182, 0.02, 1.655), (0.022, 0.018, 0.028), SKIN_M, subdiv=1)
    # cabelo cacheado
    ell((0.05, 0.02, 1.72), (0.118, 0.112, 0.1), HAIR_M, displace=0.2, disp_scale=4)
    for _ in range(14):
        a = random.uniform(0, math.tau)
        e = random.uniform(-0.2, 1.0)
        c = (0.04 + 0.1 * math.cos(a) * math.cos(e) - 0.03,
             0.02 + 0.11 * math.sin(a) * math.cos(e),
             1.72 + 0.09 * math.sin(e))
        ell(c, (0.034,) * 3, HAIR_M, subdiv=1)
    # braços segurando o rosto dela
    for sy in (-1, 1):
        sh = P(0.01, 0.23 * sy, 1.4)
        el = P(0.16, 0.27 * sy, 1.2)
        wr = P(0.27, 0.13 * sy, 1.48)
        mb.cyl(sh, el, 0.062, 0.055, SHIRT, seg=10)
        mid = el + (wr - el) * 0.25
        mb.cyl(el, mid, 0.058, 0.055, SHIRT, seg=10)
        mb.cyl(mid, wr, 0.043, 0.038, SKIN_M, seg=10)
        ell((0.30, 0.11 * sy, 1.53), (0.05, 0.03, 0.06), SKIN_M, subdiv=1)


def build_woman(mb, M):
    def P(x, y, z):
        return M @ Vector((x, y, z))

    def ell(c, s, col, **kw):
        verts = mb.ellipsoid((0, 0, 0), s, col, **kw)
        bmesh.ops.transform(mb.bm, matrix=Matrix.Translation(P(*c)) @ M.to_3x3().to_4x4(), verts=verts)

    mb.cyl(P(0, 0, 0.02), P(0, 0, 1.02), 0.3, 0.14, DRESS, seg=20)
    ell((0, 0, 1.17), (0.11, 0.15, 0.2), DRESS)
    ell((0.005, 0, 1.34), (0.1, 0.17, 0.07), SKIN_W)
    mb.cyl(P(0.01, 0, 1.36), P(0.04, 0, 1.47), 0.045, 0.042, SKIN_W, seg=10)
    ell((0.07, -0.02, 1.565), (0.095, 0.085, 0.11), SKIN_W,
        rot_euler=__import__("mathutils").Euler((0, math.radians(-12), 0)))
    ell((0.163, -0.02, 1.57), (0.02, 0.016, 0.024), SKIN_W, subdiv=1)
    # cabelo longo ondulado
    ell((-0.05, -0.02, 1.43), (0.11, 0.12, 0.26), HAIR_W, displace=0.18, disp_scale=5)
    ell((0.035, -0.02, 1.625), (0.1, 0.095, 0.08), HAIR_W, displace=0.15, disp_scale=5)
    for sy in (-1, 1):
        for k in range(5):
            z = 1.55 - k * 0.07
            ell((-0.075 - 0.012 * k, (0.075 + 0.008 * k) * sy - 0.02, z), (0.045, 0.035, 0.06), HAIR_W, subdiv=1)
    # braços na cintura dele
    for sy in (-1, 1):
        sh = P(0.0, 0.165 * sy, 1.33)
        el = P(0.1, 0.21 * sy, 1.1)
        wr = P(0.23, 0.17 * sy, 1.17)
        mb.cyl(sh, el, 0.045, 0.04, SKIN_W, seg=10)
        mb.cyl(el, wr, 0.04, 0.034, SKIN_W, seg=10)
        ell((0.25, 0.16 * sy, 1.18), (0.045, 0.025, 0.05), SKIN_W, subdiv=1)


def build_couple():
    B = Vector((1.0, 1.2, 0.0))
    right = Vector((0.57, 0.82, 0.0)).normalized()
    ang_m = math.atan2(right.y, right.x)
    Mm = Matrix.Translation(B - right * 0.2) @ Matrix.Rotation(ang_m, 4, "Z")
    Mw = Matrix.Translation(B + right * 0.2) @ Matrix.Rotation(ang_m + math.pi, 4, "Z")
    man = MeshBuilder()
    build_man(man, Mm)
    woman = MeshBuilder()
    build_woman(woman, Mw)
    return man.to_object("Man"), woman.to_object("Woman")


build_tree()
build_ground()
build_hills()
build_bg_trees()
build_couple()

tris = sum(len(o.data.polygons) for o in bpy.context.scene.objects if o.type == "MESH")
print("OBJETOS:", [o.name for o in bpy.context.scene.objects], "FACES:", tris)

bpy.ops.export_scene.gltf(
    filepath=OUT,
    export_format="GLB",
    export_colors=True,
    export_materials="NONE",
    export_yup=True,
    export_normals=True,
    export_texcoords=False,
)
print("EXPORTADO:", OUT)
