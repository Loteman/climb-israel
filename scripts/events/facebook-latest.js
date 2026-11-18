// Run in the browser on a gym's Facebook page (www.facebook.com/<page>), as
// the body of an async function / top-level-await snippet, while logged in to
// Facebook (logged out, a page shows only its newest post). Returns the page's
// newest LATEST posts from the last MAX_AGE_DAYS days: link, publish date and
// full text - the same shape as instagram-latest.js.
//
// Facebook only keeps the posts that are on screen in the DOM (the rest are
// emptied), so this scrolls down the feed and reads each post as it passes,
// first clicking its "עוד" / "See more" to expand a cut-off caption. Pinned
// (often old) posts come first, so it reads a few more than LATEST and keeps
// the newest by publish date.
const LATEST = 7;
const READ = 10;
const MAX_AGE_DAYS = 30;
const MAX_SCROLLS = 25;

const HE_MONTHS = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const EN_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pad = (n) => String(n).padStart(2, "0");

// "רביעי, 11 בנובמבר 2026 ב-19:37" or "Wednesday, November 11, 2026 at 7:37 PM".
function postedOn(text) {
  const he = text.match(new RegExp(`(\\d{1,2}) ב(${HE_MONTHS.join("|")}) (\\d{4})`));
  if (he) return `${he[3]}-${pad(HE_MONTHS.indexOf(he[2]) + 1)}-${pad(he[1])}`;
  const en = text.match(new RegExp(`(${EN_MONTHS.join("|")}) (\\d{1,2}), (\\d{4})`));
  if (en) return `${en[3]}-${pad(EN_MONTHS.indexOf(en[1]) + 1)}-${pad(en[2])}`;
  return null;
}

// The post's own link: /posts/, /reel/ or /videos/, without tracking params.
function permalink(post) {
  const hrefs = [...post.querySelectorAll("a[href]")].map((a) => a.href);
  const own = hrefs.find((h) => /\/(posts|reel|videos)\/|permalink|story_fbid/.test(h)) ?? hrefs.find((h) => /\/photo/.test(h));
  if (!own) return null;
  const url = new URL(own);
  for (const key of [...url.searchParams.keys()]) if (key.startsWith("__")) url.searchParams.delete(key);
  return url.toString();
}

async function expand(post) {
  const more = [...post.querySelectorAll('[role="button"]')].filter((b) => /^(עוד|See more)$/.test(b.innerText.trim()));
  for (const b of more) b.click();
  if (more.length) await new Promise((r) => setTimeout(r, 400));
}

window.scrollTo(0, 0);
await new Promise((r) => setTimeout(r, 2000));
const read = new Map();
for (let i = 0; i < MAX_SCROLLS && read.size < READ; i++) {
  for (const post of document.querySelectorAll("[aria-posinset]")) {
    const key = post.getAttribute("aria-posinset");
    if (read.has(key) || !post.innerText.trim()) continue;
    await expand(post);
    // Keep the post itself; drop the comments and the comment box (which
    // carries the logged-in viewer's name).
    const text = post.innerText
      .split(/\n(?:תגובות נוספות|הצגת תגובות|כתיבת תגובה|View more comments|Write a comment|Comment as)/)[0]
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    read.set(key, { url: permalink(post), postedOn: postedOn(text), caption: text });
  }
  window.scrollBy(0, 900);
  await new Promise((r) => setTimeout(r, 1200));
}

const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86_400_000).toISOString().slice(0, 10);
[...read.values()]
  .filter((p) => p.postedOn && p.postedOn >= cutoff)
  .sort((a, b) => b.postedOn.localeCompare(a.postedOn))
  .slice(0, LATEST);
