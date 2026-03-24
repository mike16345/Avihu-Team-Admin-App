import fs from "fs";
import path from "path";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import tailwindcss from "tailwindcss";
import { defineConfig, loadEnv } from "vite";
import svgr from "vite-plugin-svgr";

const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "package.json"), "utf-8")
) as { version: string };

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const appVersion = env.SENTRY_RELEASE || packageJson.version;
  const hasSentryBuildEnv =
    Boolean(env.SENTRY_AUTH_TOKEN) &&
    Boolean(env.SENTRY_ORG) &&
    Boolean(env.SENTRY_PROJECT);

  return {
    base: "/",
    build: {
      sourcemap: true,
    },
    define: {
      __APP_VERSION__: JSON.stringify(appVersion),
    },
    plugins: [
      react(),
      svgr(),
      ...(
        hasSentryBuildEnv
          ? sentryVitePlugin({
              authToken: env.SENTRY_AUTH_TOKEN,
              org: env.SENTRY_ORG,
              project: env.SENTRY_PROJECT,
              release: {
                name: appVersion,
              },
              sourcemaps: {
                filesToDeleteAfterUpload: ["./dist/**/*.js.map", "./dist/**/*.css.map"],
              },
            })
          : []
      ),
    ],
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
