import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://loteman.github.io",
  base: "/climb-israel",
  integrations: [preact(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
