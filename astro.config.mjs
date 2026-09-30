import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { SITE_URL, BASE_PATH } from "./src/site-config.ts";

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  integrations: [preact(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
