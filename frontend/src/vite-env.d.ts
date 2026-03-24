/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare module "*.svg" {
  import * as React from "react";

  export const ReactComponent: React.FunctionComponent<
    React.ComponentProps<"svg"> & { title?: string }
  >;
  export default ReactComponent;
}

interface ImportMetaEnv {
  readonly VITE_SERVER: string;
  readonly VITE_SERVER_PREVIEW_URL?: string;
  readonly VITE_API_AUTH_TOKEN: string;
  readonly VITE_CLOUDFRONT_URL: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  __sentryTest?: {
    captureError: () => string;
    captureMessage: () => string;
  };
}

declare const __APP_VERSION__: string;
