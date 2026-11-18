// Lists where events are looked for: every gym's Instagram account and
// Facebook page (from the gym pages' data, one entry per account - chains
// sharing an account appear once) and the climbing association's
// competitions page.
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

type Account = { account: string; url: string; gyms: string[] };
const instagram = new Map<string, Account>();
const facebook = new Map<string, Account>();
function add(map: Map<string, Account>, url: string, account: string, gym: string) {
  const entry = map.get(account) ?? { account, url, gyms: [] };
  entry.gyms.push(gym);
  map.set(account, entry);
}

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
  const front = fs.readFileSync(path.join(dir, file), "utf8").split("---")[1] ?? "";
  if (field(front, "kind") !== "gym") continue;
  const gym = field(front, "name") ?? file.replace(/\.md$/, "");
  const ig = field(front, "instagram");
  if (ig) add(instagram, ig, ig.replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/.*$/, ""), gym);
  // Facebook pages come as /name, /profile.php?id=N or /p/Name-N/ - the URL
  // itself is the key (chains like Performance Rock share one page).
  const fb = field(front, "facebook");
  if (fb) add(facebook, fb, fb.replace(/^https?:\/\/(www\.)?facebook\.com\//, "").replace(/\/$/, ""), gym);
}

console.log(
  JSON.stringify({ ilca: ILCA_COMPETITIONS_URL, instagram: [...instagram.values()], facebook: [...facebook.values()] }, null, 2),
);
