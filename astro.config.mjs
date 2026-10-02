import { defineConfig } from "astro/config";
import { satteri } from "@astrojs/markdown-satteri";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { SITE_URL, BASE_PATH } from "./src/site-config.ts";

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  integrations: [preact(), sitemap()],
  markdown: {
    // Astro's default processor, minus smart punctuation: Hebrew writes its
    // gershayim and geresh with " and ' (ז"ל, ג'אג), which smart quotes would
    // turn into curly quotes - and the same text in frontmatter (cards, meta
    // tags) is never "smartened", so pages and cards wouldn't match.
    processor: satteri({ features: { smartPunctuation: false } }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
