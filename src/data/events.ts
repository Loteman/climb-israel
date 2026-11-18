// Upcoming events shown in the carousel on the home page.
//
// The events themselves live in events.json, which the events run updates
// (gyms' Instagram posts + the climbing association's competitions page -
// see scripts/events/README.md). Every event has a date. It appears
// SHOW_BEFORE_DAYS before it and disappears EXPIRE_AFTER_DAYS after it: at
// build time here, and again in the visitor's browser (UpcomingEvents.astro),
// so both also happen between deploys.
import eventsJson from "./events.json";

export type EventKind = "announcement" | "competition" | "special" | "sale" | "meetup" | "workshop" | "outdoor";

export const EVENT_KIND_LABELS: Record<EventKind, string> = {
  announcement: "חדש",
  competition: "תחרות",
  special: "אירוע מיוחד",
  sale: "מבצע",
  meetup: "מפגש",
  workshop: "סדנה",
  outdoor: "יציאה לטבע",
};

export interface ClimbingEvent {
  title: string;
  /** The day it happens, YYYY-MM-DD (Israel time). Expiry counts from here. */
  date: string;
  /** Last day of a multi-day event, YYYY-MM-DD. Expiry counts from here when set. */
  endDate?: string;
  /** "19:00" or "19:00-22:00". */
  time?: string;
  /** Where it happens (omitted for site news). */
  place?: string;
  kind: EventKind;
  description: string;
  /** Where to read more: a site path ("/אודות/") or the source post (opens in a new tab). */
  url?: string;
  /** Label for the link (default "לפרטים"). */
  linkLabel?: string;
  /** Who published it, e.g. "Instagram · מאנקיז". */
  source?: string;
  /** Shown first, before the dated events (site news). */
  pinned?: boolean;
  /** Never expires - stays up until it's removed from events.json by hand. */
  noExpiry?: boolean;
}

export const EVENTS = eventsJson as ClimbingEvent[];

/** An event stays up until this many days after its date (or end date), then
 *  disappears. 0: shown through its last day, gone the next morning. */
export const EXPIRE_AFTER_DAYS = 0;

/** An event only appears this many days before its date, so a season's worth
 *  of competitions can sit in events.json without flooding the carousel. */
export const SHOW_BEFORE_DAYS = 30;

/** For events with noExpiry. */
const NEVER = "9999-12-31";

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** Last day the event is shown, YYYY-MM-DD: its (end) date plus EXPIRE_AFTER_DAYS. */
export function expiresOn(event: ClimbingEvent): string {
  return event.noExpiry ? NEVER : addDays(event.endDate ?? event.date, EXPIRE_AFTER_DAYS);
}

/** First day the event is shown, YYYY-MM-DD: SHOW_BEFORE_DAYS before its date. */
export function showsFrom(event: ClimbingEvent): string {
  return addDays(event.date, -SHOW_BEFORE_DAYS);
}

/** Today in Israel, YYYY-MM-DD. */
export function israelToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jerusalem" }).format(now);
}

/** Events not yet expired (including ones too far ahead to show yet): pinned
 *  news first, then soonest first. */
export function upcomingEvents(now = new Date(), events: ClimbingEvent[] = EVENTS): ClimbingEvent[] {
  const today = israelToday(now);
  const live = events.filter((e) => expiresOn(e) >= today);
  const pinned = live.filter((e) => e.pinned);
  const dated = live.filter((e) => !e.pinned).sort((a, b) => a.date.localeCompare(b.date));
  return [...pinned, ...dated];
}
