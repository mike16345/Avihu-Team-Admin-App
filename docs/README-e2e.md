# End-to-End Testing Guide

This project uses [Playwright](https://playwright.dev/) for end-to-end coverage. All code lives under `tests/` and is TypeScript-based.

## Prerequisites

- Node.js 18+
- Playwright browsers (`npx playwright install`)

## Environment variables

Playwright relies on the following variables. Defaults are provided for mock mode.

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_BASE_URL` | URL where the app is served | `http://localhost:5173` |
| `VITE_API_BASE` | API base URL used for network interception | `https://api.mock.local` |
| `PLAYWRIGHT_API_MODE` | `mock` (default) or `live` | `mock` |
| `E2E_TEST_USER` | Login email | `michaelgani815@gmail.com` |
| `E2E_TEST_PASS` | Login password | `Subs1234!` |
| `ALLOW_LIVE_DELETE` | Enable destructive delete scenarios in live mode | `false` |

## Running tests

```bash
cd frontend
npm ci
npx playwright install --with-deps
npx playwright test                # run entire suite
npx playwright test tests/e2e/users.spec.ts  # run a single spec
```

Artifacts (videos, traces, screenshots) are retained on failure and stored under `playwright-report/`.

## Directory layout

```
playwright.config.ts
tests/
  e2e/        # spec files (one per route/flow)
  pom/        # Page Object Model classes
  helpers/    # env, selectors, network interception utilities
  fixtures/   # deterministic mock data per entity
```

## Mock vs live execution

- **Mock** (`PLAYWRIGHT_API_MODE=mock`) intercepts every API call using the fixtures located under `tests/fixtures/`.
- **Live** (`PLAYWRIGHT_API_MODE=live`) forwards requests to `VITE_API_BASE`. Deletions are skipped unless `ALLOW_LIVE_DELETE=true`.

Use `npx playwright show-report` to inspect the latest HTML report.
