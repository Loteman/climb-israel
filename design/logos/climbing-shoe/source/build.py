import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from geom import *

OUT = os.path.dirname(__file__)
ORANGE = "#E14D2A"
RING_R = 45

def strap_mask(straps, mid):
    holes = "".join(rect_svg(r, fill="black") for r in straps)
    return (f'<mask id="{mid}" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="5000" height="5000">'
            f'<rect x="-2000" y="-2000" width="5000" height="5000" fill="white"/>{holes}</mask>')

def svg_doc(ring_w, body, k, cx, cy, pose, nudge=(0, 0)):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="{RING_R}" fill="none" stroke="{ORANGE}" stroke-width="{ring_w}"/>
  <g transform="translate({50 + nudge[0]} {50 + nudge[1]}) scale({k:.4f}) translate({-cx} {-cy}) {pose.svg()}"
     fill="none" stroke="{ORANGE}" stroke-linecap="round" stroke-linejoin="round">
{body}
  </g>
</svg>
'''

# ---------------------------------------------------------------------------
# 1. Simplicity & legibility: ONE stroke weight for ring and shoe, only the
#    lines that carry meaning (outline, pull loop, 2 straps, sole line).
# ---------------------------------------------------------------------------
def v1():
    U = 5.0                                   # stroke in viewBox units, ring and shoe alike
    pose = Pose()
    k, cx, cy = fit(all_points(), pose, RING_R - U / 2, pad=U / 2 + 7)
    sw = U / k
    tab = "M146 78 L171 40"
    sole = "M296 309 C352 324 412 348 460 380"                   # pull loop, seen edge-on
    straps = ["M322 182 L414 139", "M350 251 L442 208"]
    body = f'''    <g stroke-width="{sw:.1f}">
      <path d="{tab}"/>
      <path d="{BODY}"/>
      <path d="{sole}"/>
      {"".join(f'<path d="{s}"/>' for s in straps)}
    </g>'''
    return svg_doc(U, body, k, cx, cy, pose, nudge=(0.5, 0.6))

# ---------------------------------------------------------------------------
# 2. Climbing-shoe anatomy: solid rubber (sole/rand band that thickens toward
#    the toe, heel cup), lower tongue, strap tabs that stick out past the
#    instep like real velcro straps.
# ---------------------------------------------------------------------------
BODY_LOW_TONGUE = BODY.replace(
    "C280 165 300 125 320 100 C330 88 340 82 350 84 C360 86 366 95 372 103 C390 130",
    "C280 165 302 134 322 114 C332 104 342 100 352 102 C362 104 368 110 374 118 C390 134")
SOLE_BAND = ("M170 282 C260 292 380 330 470 385 C495 400 510 420 517.6 426.75 "
             "C518.5 440 516 451.5 510 458 C498 470 470 462 440 445 C380 410 300 350 200 300 Z")
HEEL_CUP = ("M83 112 C70 150 75 220 120 274 C100 271 85 268 70 265 "
            "C40 255 28 230 30 205 C31.2 181 45.36 151.6 69.9 125 Z")
LONG_STRAPS = [dict(x=327.2, y=138.2, w=100, h=32, rx=15, rot=(-25, 377.2, 154.2)),
               dict(x=353.2, y=208.2, w=104, h=32, rx=15, rot=(-25, 405.2, 224.2))]

def v2():
    ring_w, line = 5.0, 2.9
    pose = Pose()
    pts = path_points(BODY_LOW_TONGUE) + rect_points(TAB) + sum((rect_points(r) for r in LONG_STRAPS), [])
    k, cx, cy = fit(pts, pose, RING_R - ring_w / 2, pad=line / 2 + 5.5)
    sw = line / k
    body = f'''    <g stroke-width="{sw:.1f}">
      {strap_mask(LONG_STRAPS, "straps-v2")}
      <g mask="url(#straps-v2)">
        <path d="{SOLE_BAND}" fill="{ORANGE}"/>
        <path d="{HEEL_CUP}" fill="{ORANGE}"/>
        {rect_svg(TAB)}
        <path d="{BODY_LOW_TONGUE}"/>
        <path d="{TOE_RAND}"/>
      </g>
      {"".join(rect_svg(r) for r in LONG_STRAPS)}
    </g>'''
    return svg_doc(ring_w, body, k, cx, cy, pose, nudge=(0.6, -0.4))

# ---------------------------------------------------------------------------
# 3. Composition: toe points LEFT (toward the Hebrew wordmark that follows it
#    in an RTL header), flatter angle so ring + diagonal no longer reads like
#    a "no entry" sign, optically centred, ring and shoe weights balanced.
# ---------------------------------------------------------------------------
def v3():
    ring_w, line = 4.5, 3.0
    pose = Pose(rot=-7, mirror=True)
    k, cx, cy = fit(all_points(), pose, RING_R - ring_w / 2, pad=line / 2 + 6.8)
    sw = line / k
    body = f'''    <g stroke-width="{sw:.1f}">
      {strap_mask(STRAPS, "straps-v3")}
      <g mask="url(#straps-v3)">
        {rect_svg(TAB)}
        <path d="{BODY}"/>
        <path d="{HEEL_SEAM}"/>
        <path d="{SOLE_LINE}"/>
        <path d="{TOE_RAND}"/>
      </g>
      {"".join(rect_svg(r) for r in STRAPS)}
    </g>'''
    return svg_doc(ring_w, body, k, cx, cy, pose, nudge=(-1.3, 1.5))

for name, fn in [("v1-simple.svg", v1), ("v2-anatomy.svg", v2), ("v3-composition.svg", v3)]:
    open(os.path.join(OUT, name), "w", encoding="utf-8").write(fn())
    print("wrote", name)
