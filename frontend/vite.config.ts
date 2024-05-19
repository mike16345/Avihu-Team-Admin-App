import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";
import electron from "vite-plugin-electron/simple";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    VitePWA(),
    electron({
      main: {
        entry: "./electron/main.ts",
      },
      preload: {
        input: path.join(__dirname, "./electron/preload.ts"),
      },
      renderer: {},
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss],
    },
  },
  optimizeDeps: {
    exclude: ["js-big-decimal"],
  },
});
