# Sentry Setup

This app now initializes Sentry from [`src/instrument.ts`](../../src/instrument.ts) before any other app code runs.

What was added:

- Error monitoring through `@sentry/react`
- A reusable app-level boundary at [`src/components/errors/AppErrorBoundary.tsx`](../../src/components/errors/AppErrorBoundary.tsx)
- React Router v6 navigation tracing
- Session Replay with conservative production sampling
- Vite source-map upload support through `@sentry/vite-plugin`

Required environment variables:

- `VITE_SENTRY_DSN`: public browser DSN used by the React app
- `SENTRY_AUTH_TOKEN`: build-time token for release creation and source-map upload
- `SENTRY_ORG`: Sentry organization slug
- `SENTRY_PROJECT`: Sentry project slug

Release and source maps:

- The client SDK uses the injected `__APP_VERSION__` release value.
- Vite derives that value from `SENTRY_RELEASE` when present, otherwise from `package.json` version.
- Production builds generate source maps.
- When `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` are present, the Vite plugin creates the matching release, uploads source maps, and deletes uploaded `.map` files from `dist`.

Local verification:

1. Add `VITE_SENTRY_DSN` to your local env and restart Vite.
2. Open DevTools and run `window.__sentryTest?.captureMessage()` to send a test message.
3. Run `window.__sentryTest?.captureError()` to send a test exception.
4. Confirm the events appear in Sentry with environment `development`.
5. For a boundary UI check, temporarily throw from a route component render in a local branch and confirm the app-level fallback renders with an event ID.

Future custom issue reporting:

- The app-level fallback receives Sentry `eventId` in [`src/components/errors/AppErrorFallback.tsx`](../../src/components/errors/AppErrorFallback.tsx).
- A future "Report issue" button or feedback flow should attach there rather than being spread across individual pages.
