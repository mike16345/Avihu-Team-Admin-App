# Adjusted to frontend/: End-to-End Testing Guide

## Quick start

1. Install dependencies (once): `npm install`
2. Install Playwright browsers: `npx playwright install`
3. Copy `.env.e2e.example` to `.env.e2e` and set the values that match your environment.
4. Mock mode (default): `npm run test:e2e:mock`
5. Live mode (hits Lambda): `npm run test:e2e:live`
6. Interactive mode: `npm run test:e2e:ui`

## Environment variables

| Variable              | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `VITE_BASE_URL`       | URL where the web app is served during tests |
| `VITE_API_BASE`       | Lambda/API base used in live mode            |
| `E2E_TEST_USER`       | Admin email for live tests                   |
| `E2E_TEST_PASS`       | Admin password for live tests                |
| `PLAYWRIGHT_API_MODE` | `mock` (default) or `live`                   |

Store sensitive values (API base, credentials) in your own `.env.e2e` file or CI secrets—never commit them.

## Selector conventions

All UI interactions use deterministic `data-testid` attributes:

| Component        | Test id                                                      |
| ---------------- | ------------------------------------------------------------ |
| Navigation links | `nav-<route>-link`                                           |
| Tables           | `table-rows`, `row-<id>`, `row-<id>-edit`, `row-<id>-delete` |
| Forms            | `form-field-<name>`, `form-error-<name>`, `form-submit`      |
| States           | `loading`, `empty-state`, `toast-success`, `alert-error`     |

When adding UI, expose the test id on the smallest actionable element to keep selectors stable.

## Adding tests

1. Create or extend a Page Object in `tests/page-objects/`
2. Add deterministic fixtures or network intercepts in `tests/fixtures/`
3. Write specs inside `tests/e2e/`
4. Run `npm run test:e2e` before pushing

### Mock vs live mode

- **Mock** intercepts API calls via `page.route` using the fixtures in `tests/fixtures`. This mode is deterministic and covers negative/error scenarios.
- **Live** forwards all calls to the configured Lambda. Use it sparingly (and preferably read-only) because it mutates production-like data.

## Useful scripts

- `npm run test:e2e` – headless suite
- `npm run test:e2e:headed` – headed mode for local debugging
- `npm run test:e2e:ui` – Playwright UI mode
- `npm run test:e2e:mock` – force mock fixtures even if `PLAYWRIGHT_API_MODE` is set differently
- `npm run test:e2e:live` – bypass interceptors and use the real API

## CI integration

The workflow `.github/workflows/e2e.yml` runs the mock suite on every PR/push. Provide the secrets `VITE_API_BASE`, `E2E_TEST_USER`, and `E2E_TEST_PASS` for optional live runs.
