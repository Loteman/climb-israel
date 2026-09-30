/**
 * Build "navigate here" links from plain address/place text - no stored
 * lat/lng needed. Google Maps and Waze both geocode a text query
 * server-side, so this is accurate without us ever inventing coordinates.
 */
export function googleMapsUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function wazeUrl(query: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(query)}&navigate=yes`;
}
