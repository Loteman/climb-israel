// For each SVG: ink centroid of the shoe (ring removed) and its clearance from the ring.
const { createRequire } = require("module");
const req = createRequire("D:/Initiative Projects/Code Repositories/GitHubProjects/LotemanTools/climb-israel/package.json");
const sharp = req("sharp");
const fs = require("fs");
(async () => {
  for (const f of process.argv.slice(2)) {
    const src = fs.readFileSync(f, "utf8");
    const ringW = parseFloat(src.match(/r="45"[^>]*stroke-width="([\d.]+)"/)[1]);
    const noRing = src.replace(/<circle[^>]*\/>/, "");
    const N = 500;
    const { data } = await sharp(Buffer.from(noRing), { density: 360 }).resize(N, N).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let sx = 0, sy = 0, s = 0, maxD = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const a = data[(y * N + x) * 4 + 3] / 255;
      if (a > 0.05) {
        sx += x * a; sy += y * a; s += a;
        const d = Math.hypot(x + 0.5 - N / 2, y + 0.5 - N / 2) / N * 100;
        if (d > maxD) maxD = d;
      }
    }
    const cx = sx / s / N * 100, cy = sy / s / N * 100;
    const innerEdge = 45 - ringW / 2;
    console.log(f.split("/").pop(), `centroid=(${cx.toFixed(1)}, ${cy.toFixed(1)})`, `farthest ink=${maxD.toFixed(1)}`, `ring inner edge=${innerEdge}`, `clearance=${(innerEdge - maxD).toFixed(1)}`);
  }
})();
