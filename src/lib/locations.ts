import type { CollectionEntry } from "astro:content";
import type { NavTarget } from "./navigation";
import { REGION_LABELS } from "./labels";

type Location = CollectionEntry<"locations">;

// Crags documented as sitting inside a nature reserve where climbing is
// prohibited are kept in the content collection (real, sourced info worth
// recording) but must never appear in a public listing, the map, or get a
// live detail page - this is the single filter every page uses for that.
export function isPubliclyVisible(location: Location): boolean {
  return !(location.data.kind === "crag" && location.data.climbingProhibited);
}

export function publiclyVisibleLocations(locations: Location[]): Location[] {
  return locations.filter(isPubliclyVisible);
}

export function sortByName(locations: Location[]): Location[] {
  return [...locations].sort((a, b) => a.data.name.localeCompare(b.data.name, "he"));
}

/**
 * What the "ניווט" buttons hand to Google Maps / Waze. Gyms use their
 * street address (both apps resolve it to the business listing); crags use
 * their stored coordinates when available, since a crag's location text is
 * descriptive prose rather than something an app can geocode.
 */
export function locationNavTarget(location: Location): NavTarget {
  const { data } = location;
  if (data.kind === "gym") {
    const address = [data.address, data.city].filter(Boolean).join(", ");
    return address || data.coordinates || data.name;
  }
  return data.coordinates ?? data.locationDescription ?? data.name;
}

/** Human-readable "where is it" line for cards/tables. */
export function locationPlaceText(location: Location): string | undefined {
  const { data } = location;
  if (data.kind === "gym") {
    return [data.city, data.address].filter(Boolean).join(", ") || undefined;
  }
  return data.locationDescription;
}

/** Lower-cased haystack for the directory's free-text search. */
export function locationSearchText(location: Location): string {
  const { data } = location;
  return [
    data.name,
    REGION_LABELS[data.region],
    ...(data.kind === "gym"
      ? [data.city, data.chain, data.address]
      : [data.locationDescription]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

/**
 * First guidebook/topo that can actually be opened or downloaded - printed
 * books (which you have to buy) are listed on the crag page only.
 */
export function downloadableGuidebook(location: Location) {
  return location.data.kind === "crag"
    ? location.data.guidebooks?.find((g) => !g.printed)
    : undefined;
}

export function hasGuidebook(location: Location): boolean {
  return downloadableGuidebook(location) !== undefined;
}
