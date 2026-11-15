// Comparison sheet: original + variants, big, small sizes (light/dark) and a header mock.
const { createRequire } = require("module");
const req = createRequire("D:/Initiative Projects/Code Repositories/GitHubProjects/LotemanTools/climb-israel/package.json");
const sharp = req("sharp");
const fs = require("fs");
const [out, ...items] = process.argv.slice(2); // items: "label=path"
(async () => {
  const COL = 270, W = 40 + COL * items.length, H = 760;
  const comp = [];
  const r = async (svg, s) => sharp(svg, { density: 900 }).resize(s, s).png().toBuffer();
  let labels = "";
  for (let i = 0; i < items.length; i++) {
    const [label, file] = items[i].split("=");
    const svg = fs.readFileSync(file);
    const x0 = 20 + i * COL;
    labels += `<text x="${x0}" y="30">${label}</text>`;
    comp.push({ input: await r(svg, 230), left: x0, top: 45 });
    let x = x0;
    for (const s of [16, 26, 32, 48]) {
      comp.push({ input: await r(svg, s), left: x, top: 300 + (48 - s) / 2 });
      comp.push({ input: await r(svg, s), left: x, top: 380 + (48 - s) / 2 });
      x += s + 16;
    }
    // header mock: 26px logo + wordmark, RTL (logo on the right, text to its left)
    for (const [y, fg] of [[480, "#2b2620"], [560, "#ede9e1"]]) {
      comp.push({ input: await r(svg, 26), left: x0 + 200, top: y + 12 });
      labels += `<text x="${x0 + 192}" y="${y + 31}" text-anchor="end" font-size="19" font-weight="bold" fill="${fg}">טיפוס ישראל</text>`;
    }
    // bigger header mock at 40px
    comp.push({ input: await r(svg, 40), left: x0 + 186, top: 655 });
    labels += `<text x="${x0 + 176}" y="682" text-anchor="end" font-size="24" font-weight="bold" fill="#2b2620">טיפוס ישראל</text>`;
  }
  const base = `<svg width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#f3ede0"/>
    <rect y="370" width="${W}" height="68" fill="#211f1c"/><rect y="550" width="${W}" height="58" fill="#211f1c"/>
    <g font-family="Arial" font-size="18" fill="#2b2620">${labels}</g></svg>`;
  await sharp(Buffer.from(base)).composite(comp).png().toFile(out);
  console.log("sheet", out);
})();
