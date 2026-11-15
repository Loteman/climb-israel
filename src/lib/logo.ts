// The site logo: a climbing shoe in a ring ("2. anatomy" - solid rubber sole,
// rand and heel cup). One source for the header, the favicon, the app icons
// and the social card (scripts/generate-icons.mjs); public/offline.html keeps
// a static copy. Design source, earlier versions and the original ring-and-dot
// mark are in design/logos/.
//
// Two forms: with the ring (default) and the shoe alone (`ring: false`).
// Shoe geometry is in the coordinates of the hand sketch it was traced from;
// the transforms fit it into the 100x100 viewBox - inside the ring, or
// filling the whole box when there is no ring.

const FORMS = {
  ring: { transform: "translate(50.6 49.6) scale(0.1253) translate(-307 -261)", lineWidth: 23.1 },
  shoe: { transform: "translate(50.6 50.4) scale(0.1632) translate(-307 -261)", lineWidth: 20.8 },
};
const RING_WIDTH = 5;

// Lines that pass under a velcro strap are cut away by a mask (not covered
// with a background colour), so the logo works on any background.
const STRAPS = [
  '<rect x="327.2" y="138.2" width="100" height="32" rx="15" transform="rotate(-25 377.2 154.2)"',
  '<rect x="353.2" y="208.2" width="104" height="32" rx="15" transform="rotate(-25 405.2 224.2)"',
];
const SOLE_AND_TOE_RUBBER =
  "M170 282 C260 292 380 330 470 385 C495 400 510 420 517.6 426.75 C518.5 440 516 451.5 510 458 C498 470 470 462 440 445 C380 410 300 350 200 300 Z";
const HEEL_CUP =
  "M83 112 C70 150 75 220 120 274 C100 271 85 268 70 265 C40 255 28 230 30 205 C31.2 181 45.36 151.6 69.9 125 Z";
const PULL_LOOP = '<rect x="149" y="14" width="32" height="72" rx="15" transform="rotate(35 165 50)"/>';
const OUTLINE =
  "M160 88 C180 125 210 160 245 163 C280 165 302 134 322 114 C332 104 342 100 352 102 C362 104 368 110 374 118 C390 134 410 175 430 215 C445 250 470 320 505 385 C520 412 522 445 510 458 C498 470 470 462 440 445 C380 410 300 350 200 300 C150 278 100 272 70 265 C40 255 28 230 30 205 C32 165 70 110 132 78 Z";
const TOE_RAND = "M245 246 C330 252 420 298 475 345 C490 360 500 375 505 386";

interface LogoOptions {
  /** Stroke/fill colour - "currentColor" (default) follows the surrounding text colour. */
  color?: string;
  /** Unique per document - the strap mask is referenced by id. */
  id?: string;
  /** Extra attributes for the root <svg> (width, height, class, aria-hidden, x, y...). */
  attrs?: string;
  /** false = the shoe alone, without the surrounding ring. */
  ring?: boolean;
}

/** The logo as a standalone <svg> element (viewBox 0 0 100 100). */
export function logoSvg({ color = "currentColor", id = "logo", attrs = "", ring = true }: LogoOptions = {}): string {
  const maskId = `${id}-straps`;
  const form = ring ? FORMS.ring : FORMS.shoe;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" ${attrs}>
  <defs><mask id="${maskId}" maskUnits="userSpaceOnUse" x="-2000" y="-2000" width="5000" height="5000"><rect x="-2000" y="-2000" width="5000" height="5000" fill="white"/>${STRAPS.map((r) => `${r} fill="black"/>`).join("")}</mask></defs>
  ${ring ? `<circle cx="50" cy="50" r="45" fill="none" stroke="${color}" stroke-width="${RING_WIDTH}"/>` : ""}
  <g transform="${form.transform}" fill="none" stroke="${color}" stroke-width="${form.lineWidth}" stroke-linecap="round" stroke-linejoin="round">
    <g mask="url(#${maskId})">
      <path d="${SOLE_AND_TOE_RUBBER}" fill="${color}"/>
      <path d="${HEEL_CUP}" fill="${color}"/>
      ${PULL_LOOP}
      <path d="${OUTLINE}"/>
      <path d="${TOE_RAND}"/>
    </g>
    ${STRAPS.map((r) => `${r}/>`).join("")}
  </g>
</svg>`;
}
