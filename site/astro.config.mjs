import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

export default defineConfig({
  site: "https://box.pesky.zone",
  base: "/PeskyBox",
  publicDir: "public",
  outDir: "dist",
  trailingSlash: "always",

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});