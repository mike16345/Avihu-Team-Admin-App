import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tailwindcss from "tailwindcss";
import svgr from "vite-plugin-svgr";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "/",
    define: {
      "process.env": {
        VITE_SECURE_LOCAL_STORAGE_DISABLED_KEYS:
          env.VITE_SECURE_LOCAL_STORAGE_DISABLED_KEYS || "ScreenPrint|Plugins|Fonts|Canvas",
        VITE_SECURE_LOCAL_STORAGE_HASH_KEY: env.VITE_SECURE_LOCAL_STORAGE_HASH_KEY,
        VITE_SECURE_LOCAL_STORAGE_PREFIX: env.VITE_SECURE_LOCAL_STORAGE_PREFIX,
      },
    },
    plugins: [react(), svgr()],
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
  };
});
