// Merges newly found events into src/data/events.json.
//   npm run events:merge -- <candidates.json>   add/update events from a file
//   npm run events:merge                        just drop the expired ones
//
// Each candidate is checked (required fields, real dates, known kind, a link
// to its source). An event is identified by its link + date, so running again
// over the same posts updates instead of duplicating. Expired events
// (EXPIRE_AFTER_DAYS after their date) are removed from the file.
import fs from "node:fs";
import path from "node:path";
import { EVENT_KIND_LABELS, expiresOn, israelToday, upcomingEvents, type ClimbingEvent } from "../../src/data/events.ts";

const FILE = path.resolve(import.meta.dirname, "../../src/data/events.json");
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function problems(e: Partial<ClimbingEvent>): string[] {
  const out: string[] = [];
  if (!e.title?.trim()) out.push("missing title");
  if (!e.description?.trim()) out.push("missing description");
  if (!e.date || !DATE.test(e.date) || Number.isNaN(Date.parse(e.date))) out.push(`bad date "${e.date}"`);
  if (e.endDate && (!DATE.test(e.endDate) || e.endDate < (e.date ?? ""))) out.push(`bad endDate "${e.endDate}"`);
  if (!e.kind || !(e.kind in EVENT_KIND_LABELS)) out.push(`unknown kind "${e.kind}"`);
  if (!e.pinned && !/^https?:\/\//.test(e.url ?? "")) out.push("missing source link (url)");
  return out;
}

const key = (e: ClimbingEvent) => `${e.url ?? ""}|${e.date}`;
const existing: ClimbingEvent[] = JSON.parse(fs.readFileSync(FILE, "utf8"));
const byKey = new Map(existing.map((e) => [key(e), e]));

let added = 0;
let updated = 0;
let rejected = 0;
const candidatesFile = process.argv[2];
if (candidatesFile) {
  const candidates: Partial<ClimbingEvent>[] = JSON.parse(fs.readFileSync(candidatesFile, "utf8"));
  for (const c of candidates) {
    const issues = problems(c);
    if (issues.length) {
      rejected++;
      console.log(`  rejected "${c.title ?? "?"}": ${issues.join(", ")}`);
      continue;
    }
    const event = c as ClimbingEvent;
    if (byKey.has(key(event))) updated++;
    else added++;
    byKey.set(key(event), event);
  }
}

const today = israelToday();
const all = [...byKey.values()];
const expired = all.filter((e) => expiresOn(e) < today);
const kept = upcomingEvents(new Date(), all);
fs.writeFileSync(FILE, `${JSON.stringify(kept, null, 2)}\n`);

for (const e of expired) console.log(`  expired: ${e.date} ${e.title}`);
console.log(
  `events.json: ${kept.length} events (added ${added}, updated ${updated}, rejected ${rejected}, expired removed ${expired.length})`,
);
for (const e of kept) console.log(`  ${e.date}${e.endDate ? `-${e.endDate}` : ""}  [${e.kind}] ${e.title}${e.source ? `  (${e.source})` : ""}`);
