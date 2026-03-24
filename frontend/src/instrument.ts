import * as Sentry from "@sentry/react";
import React from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";

const dsn = import.meta.env.VITE_SENTRY_DSN;
const apiUrls = [
  import.meta.env.VITE_SERVER_PREVIEW_URL,
  import.meta.env.VITE_SERVER,
].filter((value): value is string => Boolean(value));

const createTracePropagationTargets = (): Array<string | RegExp> => {
  const targets = new Set<string>(["localhost"]);

  for (const apiUrl of apiUrls) {
    try {
      const url = new URL(apiUrl);
      const normalizedPathname = url.pathname.replace(/\/$/, "");

      targets.add(url.origin);

      if (normalizedPathname) {
        targets.add(`${url.origin}${normalizedPathname}`);
      }
    } catch {
      targets.add(apiUrl);
    }
  }

  return [/^\//, ...targets];
};

if (dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    release: __APP_VERSION__,
    integrations: [
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
    tracePropagationTargets: createTracePropagationTargets(),
    replaysSessionSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
    replaysOnErrorSampleRate: 1.0,
  });

  if (import.meta.env.DEV) {
    window.__sentryTest = {
      captureError: () =>
        Sentry.captureException(new Error("Sentry local verification error")),
      captureMessage: () =>
        Sentry.captureMessage("Sentry local verification message", "info"),
    };
  }
}
