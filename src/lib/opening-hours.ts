/**
 * Turns a gym's human-written opening hours (the `hours` record shown on its
 * page, e.g. { "א'-ה'": "16:00-23:00", "ו'": "סגור" }) into weekly time
 * intervals, so the directory can tell which gyms are open right now.
 *
 * Handles the formats used in the content: single days, ranges and lists
 * ("א'-ג', ה'"), section prefixes ("בולדר ...", "קיר גובה ..."), "מוצאי שבת",
 * several ranges in one value ("09:00-13:00, 15:00-22:30"), "סגור", and a
 * members-only tail ("07:00-23:00 (מ-18:00 מנויים בלבד)" counts as open to
 * everyone until 18:00 only). Anything else - "בתיאום טלפוני", "עד 22:30"
 * with no start time - is skipped, so that day simply never shows as open.
 * Holidays aren't modelled.
 */

/** [day, start, end]: day 0 = Sunday ... 6 = Saturday; minutes after midnight, end exclusive. */
export type WeeklyInterval = [number, number, number];

const DAY_INDEX: Record<string, number> = { א: 0, ב: 1, ג: 2, ד: 3, ה: 4, ו: 5, ש: 6 };

function parseDays(key: string): number[] {
  const cleaned = key
    .replace(/\(.*?\)/g, "")
    .replace(/בולדר|קיר גובה|וחג/g, "")
    .replace(/['׳]/g, "")
    .trim();
  if (cleaned.includes("מוצאי שבת")) return [6];
  const days: number[] = [];
  for (const token of cleaned.split(",")) {
    const [from, to] = token.split("-").map((part) => DAY_INDEX[part.trim()]);
    if (from === undefined) continue;
    if (to === undefined) days.push(from);
    else for (let d = from; d <= to; d++) days.push(d);
  }
  return days;
}

const toMinutes = (h: string, m: string) => Number(h) * 60 + Number(m);

function parseRanges(value: string): [number, number][] {
  if (value.includes("סגור")) return [];
  const membersFrom = value.match(/מ-(\d{1,2}):(\d{2}) מנויים בלבד/);
  const publicEnd = membersFrom ? toMinutes(membersFrom[1], membersFrom[2]) : Infinity;
  const main = value.split("(")[0];
  const ranges: [number, number][] = [];
  for (const m of main.matchAll(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/g)) {
    const start = toMinutes(m[1], m[2]);
    const end = Math.min(toMinutes(m[3], m[4]), publicEnd);
    if (end > start) ranges.push([start, end]);
  }
  return ranges;
}

export function parseOpeningHours(hours: Record<string, string> | undefined): WeeklyInterval[] {
  if (!hours) return [];
  const intervals: WeeklyInterval[] = [];
  for (const [key, value] of Object.entries(hours)) {
    const ranges = parseRanges(value);
    for (const day of parseDays(key)) {
      for (const [start, end] of ranges) intervals.push([day, start, end]);
    }
  }
  return intervals;
}

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Day of week and minutes after midnight in Israel, whatever the visitor's own time zone. */
export function israelWeekTime(date: Date): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { day: WEEKDAY_INDEX[get("weekday")] ?? 0, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function isOpenAt(intervals: WeeklyInterval[], date: Date): boolean {
  const { day, minutes } = israelWeekTime(date);
  return intervals.some(([d, start, end]) => d === day && minutes >= start && minutes < end);
}
