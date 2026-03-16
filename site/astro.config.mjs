import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

export default defineConfig({
  site: "https://pesky12.github.io",
  base: "/PeskyBox",
  publicDir: "public",
  outDir: "dist",

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});