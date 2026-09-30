/**
 * Schematic gear-shape library, sibling to holds/holdPaths.ts. Same 0 0 100 100
 * viewBox convention and same "topo-annotation" schematic style (simple,
 * distinguishable-at-a-glance silhouettes, not photorealistic renders).
 *
 * Gear objects are more linear/mechanical than holds, so this library adds
 * two accent-line channels on top of the base fill/stroke shape:
 * - `accentLines`: thin currentColor strokes for parts that read as metal/
 *   fabric detail (a wire loop, a cam's lobes, a lace) - same ink as the fill.
 * - `paperLines`: thin paper-colored strokes "engraved" into a filled shape
 *   (a fold crease, a drawstring) - same technique as holdPaths' holePaths,
 *   just a line instead of a cutout.
 */
export interface GearIconData {
  /** Main shape(s): filled with currentColor, or stroked if strokeOnly. */
  paths: string[];
  /** Set for stroke-only shapes (e.g. a harness diagram), rendered unfilled. */
  strokeOnly?: boolean;
  /** Paper-colored filled cutouts (loop holes, slots) - punched through the fill. */
  holePaths?: string[];
  /** Thin currentColor stroke details drawn on top (wires, cam lobes, laces). */
  accentLines?: string[];
  /** Thin paper-colored stroke details "engraved" into the fill (creases, ties). */
  paperLines?: string[];
}

export const gearIconPaths: Record<string, GearIconData> = {
  "climbing-shoe": {
    paths: [
      "M8,68 C5,54 14,42 28,40 C33,24 50,14 68,16 C84,18 93,32 89,48 C87,57 80,63 71,64 L71,70 C71,75 66,79 60,79 L19,79 C11,79 8,75 8,68 Z",
    ],
    paperLines: ["M12,64 C30,70 55,70 84,50", "M40,26 L56,42"],
  },
  "chalk-block": {
    paths: [
      "M30,40 L66,34 L74,58 L40,68 Z",
      "M20,26 a3,3 0 1,0 0.1,0 Z",
      "M78,30 a2.5,2.5 0 1,0 0.1,0 Z",
      "M26,74 a2,2 0 1,0 0.1,0 Z",
    ],
    paperLines: ["M46,42 L54,58"],
  },
  "liquid-bottle": {
    paths: [
      "M42,14 L58,14 L58,24 L64,30 L64,84 C64,88 60,90 56,90 L44,90 C40,90 36,88 36,84 L36,30 L42,24 Z",
    ],
    paperLines: ["M40,44 L60,44"],
  },
  "chalk-pouch": {
    paths: [
      "M50,10 C54,10 56,14 55,18 L70,26 C82,32 88,46 84,60 C80,76 66,88 50,88 C34,88 20,76 16,60 C12,46 18,32 30,26 L45,18 C44,14 46,10 50,10 Z",
    ],
    paperLines: ["M36,24 L64,24"],
  },
  brush: {
    paths: ["M60,14 L78,30 L40,72 L26,58 Z"],
    paperLines: ["M50,24 L34,42", "M56,30 L40,48", "M62,36 L46,54"],
  },
  "tape-roll": {
    paths: [
      "M50,16 C69,16 84,31 84,50 C84,69 69,84 50,84 C31,84 16,69 16,50 C16,31 31,16 50,16 Z",
      "M76,26 L92,14 L95,21 L80,32 Z",
    ],
    holePaths: [
      "M50,36 C58,36 64,42 64,50 C64,58 58,64 50,64 C42,64 36,58 36,50 C36,42 42,36 50,36 Z",
    ],
  },
  harness: {
    strokeOnly: true,
    paths: [
      "M22,22 L78,22 L72,34 L28,34 Z",
      "M34,34 C30,34 26,40 26,48 C26,58 32,66 40,66",
      "M66,34 C70,34 74,40 74,48 C74,58 68,66 60,66",
      "M40,66 C40,74 60,74 60,66",
      "M50,34 L50,50",
    ],
  },
  "rope-coil-dynamic": {
    strokeOnly: true,
    paths: [
      "M50,50 m-34,-8 a34,22 0 1,0 68,0 a34,22 0 1,0 -68,0",
      "M50,50 m-20,-5 a20,13 0 1,0 40,0 a20,13 0 1,0 -40,0",
      "M18,40 L6,30",
      "M82,60 L94,72",
    ],
    paperLines: ["M30,50 C38,40 46,60 54,50 C62,40 70,60 78,50"],
  },
  "rope-coil-static": {
    strokeOnly: true,
    paths: [
      "M50,50 m-34,-8 a34,22 0 1,0 68,0 a34,22 0 1,0 -68,0",
      "M50,50 m-20,-5 a20,13 0 1,0 40,0 a20,13 0 1,0 -40,0",
      "M18,40 L6,30",
      "M82,60 L94,72",
    ],
    paperLines: ["M28,50 L28,56", "M40,44 L40,50", "M52,42 L52,48", "M64,44 L64,50", "M76,50 L76,56"],
  },
  helmet: {
    paths: [
      "M14,58 C14,32 30,14 50,14 C70,14 86,32 86,58 L86,64 C86,68 82,70 78,70 L22,70 C18,70 14,68 14,64 Z",
    ],
    paperLines: ["M20,50 C34,56 66,56 80,50"],
  },
  "belay-device": {
    paths: [
      "M28,14 L72,14 C78,14 82,20 82,28 L82,80 C82,86 78,90 72,90 L28,90 C22,90 18,86 18,80 L18,28 C18,20 22,14 28,14 Z",
    ],
    holePaths: [
      "M32,30 C32,26 36,24 40,24 C44,24 48,26 48,30 L48,58 C48,62 44,64 40,64 C36,64 32,62 32,58 Z",
      "M52,30 C52,26 56,24 60,24 C64,24 68,26 68,30 L68,58 C68,62 64,64 60,64 C56,64 52,62 52,58 Z",
      "M50,74 a6,6 0 1,0 0.1,0 Z",
    ],
  },
  carabiner: {
    strokeOnly: true,
    paths: [
      "M50,10 C30,10 18,26 18,46 C18,62 28,72 28,78 C28,84 34,88 40,86 L60,86 C66,88 72,84 72,78 C72,72 82,62 82,46 C82,26 70,10 50,10 Z",
      "M28,78 L72,78",
    ],
  },
  quickdraw: {
    strokeOnly: true,
    paths: [
      "M28,14 C18,14 12,22 12,32 C12,42 18,50 28,50 C38,50 44,42 44,32 C44,22 38,14 28,14 Z",
      "M72,50 C62,50 56,58 56,68 C56,78 62,86 72,86 C82,86 88,78 88,68 C88,58 82,50 72,50 Z",
      "M34,44 L60,58",
    ],
  },
  "pas-chain": {
    paths: [
      "M10,50 C10,42 16,38 22,38 C28,38 34,42 34,50 C34,58 28,62 22,62 C16,62 10,58 10,50 Z",
      "M34,50 C34,42 40,38 46,38 C52,38 58,42 58,50 C58,58 52,62 46,62 C40,62 34,58 34,50 Z",
      "M58,50 C58,42 64,38 70,38 C76,38 82,42 82,50 C82,58 76,62 70,62 C64,62 58,58 58,50 Z",
      "M82,50 L94,50",
    ],
    holePaths: [
      "M22,50 m-6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0",
      "M46,50 m-6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0",
      "M70,50 m-6,0 a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0",
    ],
  },
  "webbing-loop": {
    paths: ["M50,50 m-38,0 a38,22 0 1,0 76,0 a38,22 0 1,0 -76,0"],
    holePaths: ["M50,50 m-26,0 a26,12 0 1,0 52,0 a26,12 0 1,0 -52,0"],
  },
  "crash-pad": {
    paths: [
      "M12,34 C12,26 18,20 26,20 L74,20 C82,20 88,26 88,34 L88,66 C88,74 82,80 74,80 L26,80 C18,80 12,74 12,66 Z",
    ],
    paperLines: ["M50,20 L50,80", "M20,30 L80,70"],
  },
  wedge: {
    paths: ["M36,40 L64,40 L74,84 L26,84 Z"],
    accentLines: ["M42,40 L42,20 C42,14 46,10 50,10 C54,10 58,14 58,20 L58,40"],
  },
  hexcentric: {
    paths: ["M50,20 L74,34 L74,66 L50,80 L26,66 L26,34 Z"],
    accentLines: ["M42,20 C42,10 46,6 50,6 C54,6 58,10 58,20"],
  },
  cam: {
    paths: ["M46,50 L54,50 L52,86 L48,86 Z"],
    accentLines: [
      "M50,50 C30,44 22,26 30,12",
      "M50,50 C38,40 34,20 44,8",
      "M50,50 C62,40 66,20 56,8",
      "M50,50 C70,44 78,26 70,12",
    ],
  },
  "nut-tool": {
    paths: [
      "M52,8 m-7,0 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0",
      "M52,15 L47,78 C46,86 39,91 30,89",
    ],
  },
  hangboard: {
    paths: ["M10,20 L90,20 L90,60 L10,60 Z"],
    holePaths: [
      "M20,60 a8,8 0 1,1 16,0 Z",
      "M42,60 a8,8 0 1,1 16,0 Z",
      "M64,60 a8,8 0 1,1 16,0 Z",
    ],
  },
  "resistance-band": {
    paths: ["M50,50 m-40,0 a40,14 0 1,0 80,0 a40,14 0 1,0 -80,0"],
    holePaths: ["M50,50 m-32,0 a32,8 0 1,0 64,0 a32,8 0 1,0 -64,0"],
  },
  "acupressure-ring": {
    paths: ["M50,50 m-30,0 a30,30 0 1,0 60,0 a30,30 0 1,0 -60,0"],
    holePaths: ["M50,50 m-14,0 a14,14 0 1,0 28,0 a14,14 0 1,0 -28,0"],
  },
};

export type GearIconId = keyof typeof gearIconPaths;
