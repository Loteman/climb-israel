import { BASE_PATH } from "../site-config";

export function withBase(path: string): string {
  const normalizedBase = BASE_PATH.endsWith("/") ? BASE_PATH : `${BASE_PATH}/`;
  return `${normalizedBase}${path.replace(/^\//, "")}`;
}

// For fields that mix site-hosted paths (e.g. "/guidebooks/x.pdf") with
// full external URLs (e.g. a wiki-hosted PDF) - only root-relative paths
// need the base prefix, an already-absolute URL must be left alone.
export function withBaseIfRelative(url: string): string {
  return url.startsWith("/") ? withBase(url) : url;
}
