/**
 * Schematic hold-shape library. One entry per iconId, keyed by the hold's
 * content-collection frontmatter. All icons share a 0 0 100 100 viewBox so
 * <HoldIcon> can render any of them identically (see interactive-svg-holds
 * skill). Shapes are deliberately simple/schematic (topo-map annotation
 * style), not photorealistic - they only need to be distinguishable at a
 * glance and consistent with each other.
 *
 * `arrow` (optional) draws a short dashed direction indicator for holds that
 * are defined by pull direction rather than shape alone (undercling/sidepull/
 * gaston all share a similar "crescent with a lip" silhouette - the arrow is
 * what actually differentiates them, exactly like a beta-sheet annotation).
 */
export interface HoldIconData {
  /** Main filled shape(s). */
  paths: string[];
  /** Optional second shape rendered as a "hole" (paper-colored cutout). */
  holePaths?: string[];
  /** Optional dashed direction arrow: [x1, y1, x2, y2]. */
  arrow?: [number, number, number, number];
  /** Set for stroke-only shapes (e.g. a crack), rendered unfilled. */
  strokeOnly?: boolean;
}

export const holdPaths: Record<string, HoldIconData> = {
  jug: {
    paths: [
      "M22,58 C16,40 28,22 50,20 C72,18 86,32 84,50 C82,66 68,78 48,78 C36,78 26,72 22,58 Z",
      "M26,60 C34,72 62,74 74,58 C70,68 58,80 44,80 C32,80 26,72 26,60 Z",
    ],
  },
  juglet: {
    paths: [
      "M32,55 C28,40 38,28 52,27 C66,26 76,36 74,50 C72,62 62,70 48,70 C40,70 34,65 32,55 Z",
    ],
  },
  crimp: {
    paths: [
      "M14,52 C14,44 20,40 30,39 L70,35 C80,34 86,38 86,46 C86,54 80,57 70,58 L30,60 C20,60 14,60 14,52 Z",
    ],
  },
  sloper: {
    paths: [
      "M8,62 C8,40 28,24 50,24 C72,24 92,40 92,62 L92,66 L8,66 Z",
    ],
  },
  pinch: {
    paths: [
      "M18,50 C18,36 28,26 40,26 C36,36 36,64 40,74 C28,74 18,64 18,50 Z",
      "M82,50 C82,36 72,26 60,26 C64,36 64,64 60,74 C72,74 82,64 82,50 Z",
    ],
    arrow: [30, 50, 70, 50],
  },
  "pocket-two-finger": {
    paths: [
      "M20,50 C20,30 36,18 54,20 C74,22 84,38 80,56 C76,72 58,80 42,76 C28,72 20,64 20,50 Z",
    ],
    holePaths: [
      "M42,42 C42,36 46,32 52,32 C58,32 62,36 62,42 L62,54 C62,60 58,64 52,64 C46,64 42,60 42,54 Z",
    ],
  },
  "pocket-mono": {
    paths: [
      "M20,50 C20,30 36,18 54,20 C74,22 84,38 80,56 C76,72 58,80 42,76 C28,72 20,64 20,50 Z",
    ],
    holePaths: ["M48,42 a8,8 0 1,0 0.1,0 Z"],
  },
  undercling: {
    paths: [
      "M20,30 C18,48 30,64 50,66 C70,64 82,48 80,30 C74,42 62,50 50,50 C38,50 26,42 20,30 Z",
    ],
    arrow: [50, 62, 50, 84],
  },
  sidepull: {
    paths: [
      "M62,14 C46,16 36,30 36,50 C36,70 46,84 62,86 C52,78 46,64 46,50 C46,36 52,22 62,14 Z",
    ],
    arrow: [40, 50, 14, 50],
  },
  gaston: {
    paths: [
      "M38,14 C54,16 64,30 64,50 C64,70 54,84 38,86 C48,78 54,64 54,50 C54,36 48,22 38,14 Z",
    ],
    arrow: [60, 50, 86, 50],
  },
  volume: {
    paths: [
      "M50,10 L86,32 L86,68 L50,90 L14,68 L14,32 Z M50,10 L50,50 M14,32 L50,50 M86,32 L50,50",
    ],
  },
  horn: {
    paths: [
      "M20,70 C18,52 24,30 42,20 C50,16 58,18 58,26 C58,34 48,36 42,44 C34,54 34,64 44,70 C36,76 24,76 20,70 Z",
    ],
  },
  edge: {
    paths: ["M10,44 L90,38 L90,54 L10,60 Z"],
  },
  hueco: {
    paths: ["M50,18 C72,18 88,34 88,54 C88,74 72,86 50,86 C28,86 12,74 12,54 C12,34 28,18 50,18 Z"],
    holePaths: ["M50,32 C64,32 74,42 74,54 C74,68 64,76 50,76 C36,76 26,68 26,54 C26,42 36,32 50,32 Z"],
  },
  smear: {
    paths: ["M40,50 C40,44 45,40 51,41 C57,42 60,47 58,53 C56,59 49,61 44,58 C41,56 40,53 40,50 Z"],
  },
  tufa: {
    paths: [
      "M50,10 C60,10 66,20 64,32 C62,44 70,52 68,64 C66,76 58,90 48,90 C40,90 34,80 36,68 C38,58 32,50 34,38 C36,24 40,10 50,10 Z",
    ],
  },
  flake: {
    paths: [
      "M20,80 C20,50 34,22 60,14 C50,26 44,46 46,64 C48,76 54,84 64,88 C48,92 20,90 20,80 Z",
    ],
  },
  crack: {
    paths: [
      "M46,4 L54,18 L44,30 L58,44 L42,58 L56,72 L46,86 L52,96",
    ],
    strokeOnly: true,
  },
};

export type HoldIconId = keyof typeof holdPaths;
