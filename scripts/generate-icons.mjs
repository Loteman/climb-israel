import sharp from "sharp";
import path from "node:path";
import { mkdir } from "node:fs/promises";

const ROOT = path.resolve(import.meta.dirname, "..");
const source = path.join(ROOT, "scripts/icon-source.svg");
const outDir = path.join(ROOT, "public/icons");

await mkdir(outDir, { recursive: true });

const targets = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "icon-512-maskable.png", size: 512 },
  { file: "apple-touch-icon.png", size: 180 },
];

for (const t of targets) {
  await sharp(source, { density: 384 })
    .resize(t.size, t.size)
    .png()
    .toFile(path.join(outDir, t.file));
  console.log(`wrote ${t.file} (${t.size}x${t.size})`);
}
