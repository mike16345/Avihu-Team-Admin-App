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
  readonly VITE_SERVER_IP: string;
  readonly VITE_SERVER_PORT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
