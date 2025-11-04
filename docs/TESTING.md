# Testing Strategy

This repository uses Playwright for automated end-to-end coverage. The suite runs entirely in TypeScript and is designed to operate in deterministic mock mode by default, while allowing an opt-in live run against real services.

## Test Pyramid

- **Unit/Component (out of scope)** – handled in the existing frontend project (React Testing Library, etc.).
- **Integration** – React Query hooks are verified indirectly through mocked API flows in Playwright.
- **End-to-End** – Playwright specs under `tests/e2e/` simulate real user behaviour via page objects.

## Directory Layout

```
playwright.config.ts
tests/
  e2e/          # feature specs (one per route/flow)
  pom/          # Page Object Model classes
  helpers/      # env helpers, selectors, network interception utilities
  fixtures/     # deterministic API payloads for mock mode
```

## Selector Policy

- Use `data-testid` attributes defined in the application. The canonical list lives in `tests/helpers/ids.ts`.
- Prefer domain-specific IDs over structural selectors; e.g., `row-<id>-delete` instead of `.btn:nth-child(2)`.
- `BasePage` exposes helpers for common interactions (`waitReady`, `expectRows`, etc.).

## Environment Modes

- `PLAYWRIGHT_API_MODE=mock` (default) – all HTTP requests matching `VITE_API_BASE` are intercepted with fixture data. Use helper `interceptJSON` or `interceptTimeout` to stub responses.
- `PLAYWRIGHT_API_MODE=live` – requests hit the configured backend. Destructive actions stay disabled unless `ALLOW_LIVE_DELETE=true`.

Required environment variables:

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_BASE_URL` | Application URL under test | `http://localhost:5173` |
| `VITE_API_BASE` | API base URL intercepted in mock mode | `https://api.mock.local` |
| `E2E_TEST_USER` | Primary login email | `michaelgani815@gmail.com` |
| `E2E_TEST_PASS` | Primary login password | `Subs1234!` |
| `PLAYWRIGHT_API_MODE` | `mock` or `live` | `mock` |
| `ALLOW_LIVE_DELETE` | Enable destructive deletes in live mode | `false` |

## Running Locally

```bash
cd frontend
npm ci
npx playwright install --with-deps
npx playwright test
```

Add `PLAYWRIGHT_API_MODE=live` to target a real backend. Use `npx playwright show-report` after a run to inspect traces.

## Adding New Coverage

1. Add/confirm `data-testid` attributes in the relevant React component.
2. Update `tests/helpers/ids.ts` only if a new selector pattern is required.
3. Create a new Page Object in `tests/pom/` encapsulating the flow.
4. Implement fixtures under `tests/fixtures/` and stub endpoints via `tests/helpers/network.ts`.
5. Write a spec in `tests/e2e/` describing the scenario using `test.step` for readability.
6. Document manual coverage expectations in `docs/MANUAL-TEST-PLAN.md`.

## Flake Mitigation

- Avoid arbitrary `wait` statements; rely on `locator.waitFor` and `expect`.
- `BasePage.waitReady()` already handles DOM and network idle states, plus loader disappearance.
- Use fixtures that return consistent IDs and timestamps to keep assertions deterministic.
- Prefer `page.route` mocks scoped per test to avoid state leakage.
