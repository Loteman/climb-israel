// Run in the browser on an Instagram profile page (www.instagram.com/<account>/),
// as the body of an async function / top-level-await snippet. Returns the
// account's newest LATEST posts from the last MAX_AGE_DAYS days: link,
// publish date and full caption.
//
// The profile grid also shows pinned (often old) posts first, so it reads a
// few more than LATEST and keeps the newest by publish date. Posts older than
// MAX_AGE_DAYS are dropped - they're almost always about an event that has
// already happened. Captions come from each post page's og:description,
// fetched from the same origin - no navigation per post.
const LATEST = 7;
const READ = 12;
const MAX_AGE_DAYS = 30;

await new Promise((r) => setTimeout(r, 2500)); // let the grid render
const codes = [
  ...new Set(
    [...document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]')].map(
      (a) => a.getAttribute("href").split("/").filter(Boolean).pop(),
    ),
  ),
].slice(0, READ);

const posts = await Promise.all(
  codes.map(async (code) => {
    const html = await (await fetch(`/p/${code}/`, { credentials: "include" })).text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const og = doc.querySelector('meta[property="og:description"]')?.content ?? "";
    // og:description: '<likes>, <comments> - <account> on November 4, 2026: "<caption>". '
    const m = og.match(/ on ([A-Z][a-z]+ \d{1,2}, \d{4})[^:]*:\s*"([\s\S]*)"/);
    const posted = m ? new Date(`${m[1]} 12:00 UTC`) : null;
    return {
      url: `https://www.instagram.com/p/${code}/`,
      postedOn: posted ? posted.toISOString().slice(0, 10) : null,
      caption: m ? m[2].trim() : og,
    };
  }),
);

const cutoff = new Date(Date.now() - MAX_AGE_DAYS * 86_400_000).toISOString().slice(0, 10);
posts
  .filter((p) => p.postedOn && p.postedOn >= cutoff)
  .sort((a, b) => b.postedOn.localeCompare(a.postedOn))
  .slice(0, LATEST);
