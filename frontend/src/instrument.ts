import * as Sentry from "@sentry/react";
import React from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";

const dsn = import.meta.env.VITE_SENTRY_DSN;
const tracePropagationTargets = ["localhost", /^\//];



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
    tracePropagationTargets: tracePropagationTargets,
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
