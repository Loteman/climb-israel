import sys, os
S = sys.argv[1]
ORANGE, PAPER, INK = "#E14D2A", "#F3EDE0", "#2B2620"

# Traced from the user's sketch (sketch pixel coordinates, 538x526).
TAB = '<rect x="149" y="14" width="32" height="72" rx="15" transform="rotate(35 165 50)"/>'
BODY = "M160 88 C180 125 210 160 245 163 C280 165 300 125 320 100 C330 88 340 82 350 84 C360 86 366 95 372 103 C390 130 410 175 430 215 C445 250 470 320 505 385 C520 412 522 445 510 458 C498 470 470 462 440 445 C380 410 300 350 200 300 C150 278 100 272 70 265 C40 255 28 230 30 205 C32 165 70 110 132 78 Z"
DETAILS = [
    "M78 128 C110 180 135 235 170 282",            # heel counter seam
    "M78 128 C55 148 38 180 40 214 C42 240 55 256 74 264",  # heel rand
    "M170 282 C260 292 380 330 470 385 C495 400 510 420 515 432",  # sole line
    "M245 246 C330 252 420 298 475 345 C490 360 500 375 505 386",  # toe rand
]
STRAPS = [
    '<rect x="328" y="142" width="82" height="32" rx="15" transform="rotate(-25 369 158)"/>',
    '<rect x="354" y="212" width="86" height="32" rx="15" transform="rotate(-25 397 228)"/>',
]

def shoe(line, fill, sw, details=True, outline=None):
    d = "".join(f'<path d="{p}"/>' for p in DETAILS) if details else ""
    return f'''<g stroke="{line}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round">
      <g fill="{fill}" stroke="{outline or line}">{TAB}<path d="{BODY}"/></g>
      <g fill="none">{d}</g>
      <g fill="{fill}">{"".join(STRAPS)}</g>
    </g>'''

def logo(name, *, disc, k=0.136, cx=304, cy=264, sw=18, details=True, bg=None):
    if disc:   # solid orange circle, paper-coloured shoe drawn in orange lines
        circle = f'<circle cx="50" cy="50" r="48" fill="{ORANGE}"/>'
        inner = shoe(ORANGE, PAPER, sw, details, outline=PAPER)
    else:      # orange ring, orange line-art shoe (transparent background)
        circle = f'<circle cx="50" cy="50" r="45" fill="none" stroke="{ORANGE}" stroke-width="6"/>'
        inner = shoe(ORANGE, PAPER if bg else "none", sw, details)
    back = f'<rect width="100" height="100" fill="{bg}"/>' if bg else ""
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  {back}{circle}
  <g transform="translate(50 50) scale({k}) translate({-cx} {-cy})">
    {inner}
  </g>
</svg>
'''
    open(os.path.join(S, name), "w", encoding="utf-8").write(svg)

logo("v6-ring.svg", disc=False, bg=PAPER)
logo("v6-disc.svg", disc=True, k=0.15)
