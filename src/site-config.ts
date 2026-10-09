// Single source of truth for where this site is deployed. Change these two
// values and every internal link (via withBase()), the Astro site/base
// config, and the generated content all follow automatically. BASE_PATH is
// "" because the site is served from the root of its own (sub)domain.
//
// The only things that DON'T read from here, because they're static files
// with no build step of their own, are public/manifest.webmanifest,
// public/robots.txt, public/sw.js and public/offline.html (BASE_PATH
// hardcoded, plus the domain in robots.txt) - those need updating by hand
// if either ever changes.
export const SITE_URL = "https://climb-israel.loteman.com";
export const BASE_PATH = "";

export const SITE_NAME = "טיפוס ישראל";

// Where "report a mistake / suggest a site / request removal" goes. Every
// "צרו קשר" link on the site is built from this address.
export const CONTACT_EMAIL = "lotemangames@gmail.com";

/** mailto: link to CONTACT_EMAIL, with a pre-filled subject line. */
export function contactUrl(subject = SITE_NAME): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

// Content license. Covers only the site's own original material - third-
// party content (guidebooks/topos, texts quoted from ILCA, OSM map tiles,
// trademarks) stays with its owners; see the About page's license section.
export const LICENSOR_NAME = "Loteman Games";
export const LICENSOR_URL = "https://loteman.com/";
export const LICENSE_NAME = "CC BY-SA 4.0";
export const LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/";
