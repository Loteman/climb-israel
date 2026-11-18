// Lists where events are looked for: every gym's Instagram account (from the
// gym pages' data, one entry per account - chains sharing an account appear
// once) and the climbing association's competitions page.
// Run: npm run events:sources
import fs from "node:fs";
import path from "node:path";

// The national league page; its "רשימת תחרויות" link is a Google Drive PDF
// with the season's table (gym, date, categories, discipline, hours).
// Cancelled rows are struck through in the PDF.
export const ILCA_COMPETITIONS_URL =
  "https://ilca.org.il/%D7%A1%D7%A4%D7%95%D7%A8%D7%98/%D7%AA%D7%97%D7%A8%D7%95%D7%99%D7%95%D7%AA-%D7%9C%D7%90%D7%95%D7%9E%D7%99%D7%95%D7%AA-2/%D7%9C%D7%99%D7%92%D7%94-%D7%90%D7%A8%D7%A6%D7%99%D7%AA/";

const dir = path.resolve(import.meta.dirname, "../../src/content/locations");
const field = (text: string, name: string) => text.match(new RegExp(`^${name}: "?([^"\\n]*)"?$`, "m"))?.[1];

const accounts = new Map<string, { account: string; instagram: string; gyms: string[] }>();
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
  const front = fs.readFileSync(path.join(dir, file), "utf8").split("---")[1] ?? "";
  if (field(front, "kind") !== "gym") continue;
  const instagram = field(front, "instagram");
  if (!instagram) continue;
  const account = instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, "");
  const entry = accounts.get(account) ?? { account, instagram, gyms: [] };
  entry.gyms.push(field(front, "name") ?? file.replace(/\.md$/, ""));
  accounts.set(account, entry);
}

console.log(JSON.stringify({ ilca: ILCA_COMPETITIONS_URL, instagram: [...accounts.values()] }, null, 2));
