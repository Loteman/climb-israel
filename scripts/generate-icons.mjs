// Generates the PWA icons and the social-share card into public/.
// Run with `npm run gen:icons` after changing the logo or the OG design.
import sharp from "sharp";
import path from "node:path";
import os from "node:os";
import { inflateSync } from "node:zlib";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const ROOT = path.resolve(import.meta.dirname, "..");
const source = path.join(ROOT, "scripts/icon-source.svg");
const outDir = path.join(ROOT, "public/icons");

await mkdir(outDir, { recursive: true });

const targets = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
];

for (const t of targets) {
  await sharp(source, { density: 384 })
    .resize(t.size, t.size)
    .png()
    .toFile(path.join(outDir, t.file));
  console.log(`wrote ${t.file} (${t.size}x${t.size})`);
}

// Maskable icons are cropped by the OS (circle, squircle...) and must be
// full-bleed: the rounded-corner source above would leave transparent
// corners showing through. Same mark, square background, and the logo
// kept inside the central 80% "safe zone".
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#2B2620"/>
  <circle cx="256" cy="256" r="132" fill="none" stroke="#E14D2A" stroke-width="30"/>
  <circle cx="256" cy="256" r="37" fill="#E14D2A"/>
</svg>`;
await sharp(Buffer.from(maskableSvg)).png().toFile(path.join(outDir, "icon-512-maskable.png"));
console.log("wrote icon-512-maskable.png (512x512, full-bleed)");

// ---------------------------------------------------------------------------
// Open Graph / social card (1200x630) -> public/og-image.png
// ---------------------------------------------------------------------------

// sharp renders text through Pango, which needs a TTF/OTF file. The site's
// fonts ship as WOFF/WOFF2 only; WOFF1 is just zlib-compressed sfnt tables,
// so unwrap it into a temporary .ttf rather than adding a dependency.
function woffToSfnt(woff) {
  if (woff.toString("ascii", 0, 4) !== "wOFF") throw new Error("not a WOFF1 file");
  const flavor = woff.readUInt32BE(4);
  const numTables = woff.readUInt16BE(12);
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const at = 44 + i * 20;
    const offset = woff.readUInt32BE(at + 4);
    const compLength = woff.readUInt32BE(at + 8);
    const origLength = woff.readUInt32BE(at + 12);
    const raw = woff.subarray(offset, offset + compLength);
    tables.push({
      tag: woff.subarray(at, at + 4),
      checksum: woff.readUInt32BE(at + 16),
      data: compLength < origLength ? inflateSync(raw) : raw,
    });
  }
  const pad4 = (n) => (n + 3) & ~3;
  let dataOffset = 12 + numTables * 16;
  const size = tables.reduce((sum, t) => sum + pad4(t.data.length), dataOffset);
  const out = Buffer.alloc(size);
  const maxPow2 = 2 ** Math.floor(Math.log2(numTables));
  out.writeUInt32BE(flavor, 0);
  out.writeUInt16BE(numTables, 4);
  out.writeUInt16BE(maxPow2 * 16, 6);
  out.writeUInt16BE(Math.log2(maxPow2), 8);
  out.writeUInt16BE(numTables * 16 - maxPow2 * 16, 10);
  tables.forEach((t, i) => {
    const rec = 12 + i * 16;
    t.tag.copy(out, rec);
    out.writeUInt32BE(t.checksum, rec + 4);
    out.writeUInt32BE(dataOffset, rec + 8);
    out.writeUInt32BE(t.data.length, rec + 12);
    t.data.copy(out, dataOffset);
    dataOffset += pad4(t.data.length);
  });
  return out;
}

async function fontFile(weight) {
  const woff = await readFile(
    path.join(
      ROOT,
      `node_modules/@fontsource/ibm-plex-sans-hebrew/files/ibm-plex-sans-hebrew-hebrew-${weight}-normal.woff`,
    ),
  );
  const file = path.join(os.tmpdir(), `climb-israel-plex-hebrew-${weight}.ttf`);
  await writeFile(file, woffToSfnt(woff));
  return file;
}

async function textLayer(text, { weight, size, color }) {
  const { data, info } = await sharp({
    text: {
      text: `<span foreground="${color}">${text}</span>`,
      font: `IBM Plex Sans Hebrew ${weight === 700 ? "Bold" : "Medium"} ${size}`,
      fontfile: await fontFile(weight),
      rgba: true,
      dpi: 72,
    },
  })
    .png()
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

const W = 1200;
const H = 630;
const contours = Array.from({ length: 9 }, (_, i) => {
  const y = 40 + i * 70;
  return `<path d="M-40 ${y} C 220 ${y - 45}, 380 ${y + 55}, 640 ${y} S 1020 ${y - 40}, 1260 ${y + 10}" fill="none" stroke="#c9bfa5" stroke-width="2" opacity="0.7"/>`;
}).join("");
const background = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#f3ede0"/>
  ${contours}
  <rect x="0" y="${H - 18}" width="${W}" height="18" fill="#b4361a"/>
  <circle cx="${W / 2}" cy="150" r="58" fill="#f3ede0" stroke="#b4361a" stroke-width="10"/>
  <circle cx="${W / 2}" cy="150" r="14" fill="#b4361a"/>
  <line x1="${W / 2 - 220}" y1="455" x2="${W / 2 + 220}" y2="455" stroke="#b4361a" stroke-width="5" stroke-dasharray="2 16" stroke-linecap="round"/>
  <circle cx="${W / 2 - 220}" cy="455" r="9" fill="#b4361a"/>
  <circle cx="${W / 2 + 220}" cy="455" r="9" fill="#b4361a"/>
</svg>`;

const title = await textLayer("טיפוס ישראל", { weight: 700, size: 110, color: "#2b2620" });
const subtitle = await textLayer("מדריך קהילתי לטיפוס ובולדרינג בישראל", {
  weight: 500,
  size: 44,
  color: "#5a5347",
});
const tagline = await textLayer("קירות טיפוס · אתרי טבע · גיידבוקים · מדריכים", {
  weight: 500,
  size: 32,
  color: "#9e4b28",
});

await sharp(Buffer.from(background))
  .composite([
    { input: title.data, left: Math.round((W - title.width) / 2), top: 235 },
    { input: subtitle.data, left: Math.round((W - subtitle.width) / 2), top: 375 },
    { input: tagline.data, left: Math.round((W - tagline.width) / 2), top: 495 },
  ])
  .png({ compressionLevel: 9 })
  .toFile(path.join(ROOT, "public/og-image.png"));
console.log(`wrote og-image.png (${W}x${H})`);
