import type { CollectionEntry } from "astro:content";

// Crags documented as sitting inside a nature reserve where climbing is
// prohibited are kept in the content collection (real, sourced info worth
// recording) but must never appear in a public listing, the map, or get a
// live detail page - this is the single filter every page uses for that.
export function isPubliclyVisible(location: CollectionEntry<"locations">): boolean {
  return !(location.data.kind === "crag" && location.data.climbingProhibited);
}

export function publiclyVisibleLocations(
  locations: CollectionEntry<"locations">[],
): CollectionEntry<"locations">[] {
  return locations.filter(isPubliclyVisible);
}
