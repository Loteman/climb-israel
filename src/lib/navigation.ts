/**
 * Build "navigate here" links for Google Maps and Waze.
 *
 * A target is either free text (an address - both apps geocode it
 * server-side) or exact coordinates. Coordinates win whenever we have
 * them for a crag: a crag's "location" is prose like "על ציר דרך האבות,
 * בין הישובים..." that neither app can geocode reliably, while the stored
 * lat/lng is the same point the site's own map pins.
 */
export type NavTarget = string | { lat: number; lng: number };

function coordsParam({ lat, lng }: { lat: number; lng: number }): string {
  return `${lat},${lng}`;
}

export function googleMapsUrl(target: NavTarget): string {
  const query = typeof target === "string" ? target : coordsParam(target);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function wazeUrl(target: NavTarget): string {
  return typeof target === "string"
    ? `https://waze.com/ul?q=${encodeURIComponent(target)}&navigate=yes`
    : // Waze's documented deep-link format: ll=<lat>,<lng> with a literal comma.
      `https://waze.com/ul?ll=${coordsParam(target)}&navigate=yes`;
}
