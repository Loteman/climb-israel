"""Geometry helpers for the logo variants: sample the traced paths, transform
them, and fit the shoe inside the ring with even padding."""
import math, re

# --- Traced from the user's sketch (sketch pixel coordinates, 538x526) -------
TAB = dict(x=149, y=14, w=32, h=72, rx=15, rot=(35, 165, 50))
BODY = ("M160 88 C180 125 210 160 245 163 C280 165 300 125 320 100 C330 88 340 82 350 84 "
        "C360 86 366 95 372 103 C390 130 410 175 430 215 C445 250 470 320 505 385 "
        "C520 412 522 445 510 458 C498 470 470 462 440 445 C380 410 300 350 200 300 "
        "C150 278 100 272 70 265 C40 255 28 230 30 205 C32 165 70 110 132 78 Z")
HEEL_SEAM = "M78 128 C110 180 135 235 170 282"
HEEL_RAND = "M78 128 C55 148 38 180 40 214 C42 240 55 256 74 264"
SOLE_LINE = "M170 282 C260 292 380 330 470 385 C495 400 510 420 515 432"
TOE_RAND = "M245 246 C330 252 420 298 475 345 C490 360 500 375 505 386"
STRAPS = [dict(x=328, y=142, w=82, h=32, rx=15, rot=(-25, 369, 158)),
          dict(x=354, y=212, w=86, h=32, rx=15, rot=(-25, 397, 228))]

def rect_svg(r, **attrs):
    a, px, py = r["rot"]
    extra = "".join(f' {k.replace("_", "-")}="{v}"' for k, v in attrs.items())
    return (f'<rect x="{r["x"]}" y="{r["y"]}" width="{r["w"]}" height="{r["h"]}" rx="{r["rx"]}" '
            f'transform="rotate({a} {px} {py})"{extra}/>')

def _rot(p, a, px, py):
    c, s = math.cos(math.radians(a)), math.sin(math.radians(a))
    x, y = p[0] - px, p[1] - py
    return (px + x * c - y * s, py + x * s + y * c)

def rect_points(r):
    a, px, py = r["rot"]
    pts = [(r["x"], r["y"]), (r["x"] + r["w"], r["y"]), (r["x"], r["y"] + r["h"]), (r["x"] + r["w"], r["y"] + r["h"])]
    return [_rot(p, a, px, py) for p in pts]

def path_points(d, n=24):
    toks = re.findall(r"[MCLZ]|-?\d*\.?\d+", d)
    pts, i, cur, start, cmd = [], 0, None, None, None
    while i < len(toks):
        t = toks[i]
        if t in "MCLZ":
            cmd = t; i += 1
            if t == "Z":
                cur = start
            continue
        if cmd == "M":
            cur = start = (float(toks[i]), float(toks[i + 1])); pts.append(cur); i += 2; cmd = "L"
        elif cmd == "L":
            cur = (float(toks[i]), float(toks[i + 1])); pts.append(cur); i += 2
        elif cmd == "C":
            p1 = (float(toks[i]), float(toks[i + 1])); p2 = (float(toks[i + 2]), float(toks[i + 3]))
            p3 = (float(toks[i + 4]), float(toks[i + 5])); i += 6
            for k in range(1, n + 1):
                u = k / n; v = 1 - u
                pts.append((v**3 * cur[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u**3 * p3[0],
                            v**3 * cur[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u**3 * p3[1]))
            cur = p3
    return pts

class Pose:
    """Rotate by `rot` degrees around the shoe, optionally mirror (toe pointing left)."""
    def __init__(self, rot=0.0, mirror=False, pivot=(275, 240)):
        self.rot, self.mirror, self.pivot = rot, mirror, pivot
    def apply(self, p):
        q = _rot(p, self.rot, *self.pivot)
        return (2 * self.pivot[0] - q[0], q[1]) if self.mirror else q
    def svg(self):
        px, py = self.pivot
        t = f"rotate({self.rot} {px} {py})" if self.rot else ""
        return (f"translate({2 * px} 0) scale(-1 1) " + t).strip() if self.mirror else t

def fit(points, pose, inner_r, pad):
    """Center + scale so every transformed point sits `pad` units inside a circle of radius `inner_r`."""
    pts = [pose.apply(p) for p in points]
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    best = None
    for cx in range(int(min(xs)), int(max(xs)), 2):
        for cy in range(int(min(ys)), int(max(ys)), 2):
            m = max(math.hypot(x - cx, y - cy) for x, y in pts)
            if best is None or m < best[0]:
                best = (m, cx, cy)
    m, cx, cy = best
    return (inner_r - pad) / m, cx, cy

def all_points(extra_paths=()):
    pts = path_points(BODY) + rect_points(TAB)
    for r in STRAPS:
        pts += rect_points(r)
    for d in extra_paths:
        pts += path_points(d)
    return pts
