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

// Where "report a mistake / suggest a site / request removal" links point.
// GitHub Issues for now (the repo is public); swap for a form or a mailto:
// address here and every "צרו קשר" link on the site follows.
export const REPO_URL = "https://github.com/Loteman/climb-israel";
export const CONTACT_URL = `${REPO_URL}/issues/new`;
