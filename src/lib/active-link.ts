import { withBase } from "./url";

/**
 * Astro.url.pathname is percent-encoded ("/climb-israel/%D7%90...") while
 * every nav href on this site is written in plain Hebrew, so comparing the
 * two directly never matched - the header's "you are here" highlight was
 * silently dead on every Hebrew-slug page. Decode before comparing.
 */
export function currentPathname(url: URL): string {
  try {
    return decodeURIComponent(url.pathname);
  } catch {
    return url.pathname;
  }
}

/**
 * aria-current value for a nav link: "page" on the page itself, "true"
 * anywhere inside its section (e.g. a hold's detail page under
 * /אחיזות-טיפוס/), undefined otherwise.
 */
export function linkState(currentPath: string, href: string): "page" | "true" | undefined {
  const target = withBase(href);
  const normalize = (p: string) => (p.endsWith("/") ? p : `${p}/`);
  const here = normalize(currentPath);
  if (here === normalize(target)) return "page";
  if (target !== withBase("/") && here.startsWith(normalize(target))) return "true";
  return undefined;
}
