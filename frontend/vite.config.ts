import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
import svgr from "vite-plugin-svgr";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/",
  plugins: [react(), svgr(), VitePWA()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  preview: {
    port: 8080,
    strictPort: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    origin: "http://0.0.0.0:3000",
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
