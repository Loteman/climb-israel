// Single source of truth for where this site is deployed. Change these two
// values and every internal link (via withBase()), the Astro site/base
// config, and the generated content all follow automatically.
//
// The only things that DON'T read from here, because they're static files
// with no build step of their own, are public/manifest.webmanifest,
// public/robots.txt, public/sw.js and public/offline.html - those have
// BASE_PATH hardcoded and need updating by hand if it ever changes.
export const SITE_URL = "https://loteman.github.io";
export const BASE_PATH = "/climb-israel";

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
export const LICENSOR_URL = "https://loteman.github.io/Loteman-Games/";
export const LICENSE_NAME = "CC BY-SA 4.0";
export const LICENSE_URL = "https://creativecommons.org/licenses/by-sa/4.0/";
