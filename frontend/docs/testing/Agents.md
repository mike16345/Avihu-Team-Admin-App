# UI Automation Rules (Playwright)

## 1. Purpose

This document defines the UI automation standards for this Vite + React + TypeScript admin frontend.

The goals of automation are:

* Deterministic, low-flake PR validation
* Fast feedback for route-level screens
* Clear separation between UI behavior validation and backend logic validation
* Debuggable failures via traces, screenshots, and videos

UI automation must respect the existing layered architecture:

Page → Query/Mutation Hook → Resource API Wrapper → Shared Axios Client

UI tests must not bypass this layering.

---

# 2. Test Suite Structure

## 2.1 UI Smoke (Mocked API) — Required

Runs on every pull request.

Purpose:

* Validate UI rendering
* Validate form behavior
* Validate navigation flows
* Validate loading, success, and error states
* Validate user-visible feedback (toasts, banners, modals)

Constraints:

* Must not depend on real backend
* Must not allow real network calls
* Must fail fast on unexpected/unmocked API requests

This suite validates UI behavior only, not backend business logic.

---

## 2.2 API Tests (Backend Repository)

Backend validation does not belong in this frontend repository.

Backend tests are responsible for:

* Validation rules
* Auth rules
* DB behavior
* Business logic correctness

UI tests are not responsible for server correctness.

---

## 2.3 Minimal E2E Real (Optional, Limited)

Runs on `main` branch or nightly only.

Purpose:

* Validate frontend/backend contract compatibility
* Validate authentication/session integration
* Detect breaking API shape changes

Constraints:

* Maximum 3–5 critical flows
* Must use seeded or isolated test account
* Must not depend on production data
* Must not expand into full regression coverage

---

# 3. Folder Structure

All UI tests live under:

```
tests/
  e2e/
    specs/
    mocks/
    utils/
```

* `specs/` → Test files
* `mocks/` → Static JSON fixtures
* `utils/` → Shared mocking helpers

Playwright configuration must:

* Use `vite preview`
* Target `http://127.0.0.1:4173`
* Enable trace on first retry
* Capture screenshot + video on failure

---

# 4. Selector Policy (Mandatory)

Locator priority:

1. `getByTestId()`
2. `getByRole()` with accessible name
3. `getByText()` only if text is stable and intentional

Never use:

* nth-child selectors
* brittle CSS structural selectors
* XPath
* `waitForTimeout()` unless absolutely unavoidable and documented

Rely on Playwright auto-waiting behavior.

---

# 5. data-testid Standards

UI automation relies primarily on `data-testid`.

## 5.1 Naming Rules

* kebab-case
* prefix by domain:

Examples:

* `auth-*`
* `users-*`
* `leads-*`
* `settings-*`
* `nav-*`
* `table-*`
* `toast-*`

Examples:

* `auth-login-root`
* `auth-login-email`
* `auth-login-submit`
* `users-table-root`
* `users-table-row-<id>`
* `users-table-row-open-<id>`
* `toast-success`
* `toast-error`

---

## 5.2 Where to Add Test IDs

Add testids to:

* Screen root container
* Primary action buttons
* Form inputs
* Modal root containers
* Table/list root containers
* Table rows (if stable ID exists)
* Loading states
* Empty states
* Error banners
* Toast containers

Do not add testids to:

* Decorative wrappers
* Icons
* Styling-only divs
* Pure layout containers

Test IDs must not replace semantic HTML or accessibility attributes.

---

# 6. Mocking Policy (Axios + Playwright)

All HTTP transport flows through `src/API/api.ts`.

UI Smoke tests must:

* Intercept requests at the browser level using Playwright
* Match endpoints by path, not by hardcoded host
* Store JSON fixtures under `tests/e2e/mocks/`
* Abort unexpected or unmocked API requests

## 6.1 Fail-Fast Rule

* Any unmocked API request must cause the test to fail.
* Real backend calls are not allowed in UI Smoke suite.
* Silent network fallthrough is prohibited.

---

## 6.2 Axios Endpoint Matching

* Mock routes must match endpoint paths (e.g., `/users/many`)
* Do not couple mocks to specific API domain or environment
* Prefer regex path matching over full URL matching

---

# 7. TanStack Query Behavior in Tests

The application uses:

* Persisted query client
* `gcTime = Infinity`
* Long-lived cache

Testing rules:

* Each Playwright test runs in an isolated browser context
* Tests must not rely on persisted query cache
* Tests must explicitly assert loading → success transitions
* Tests must not depend on warmed cache state

Do not share storage state in UI Smoke suite.

---

# 8. Naming Conventions

Test files:

```
tests/e2e/specs/<domain>/<feature>.spec.ts
```

Test title format:

```
"<screen> - <action> - <expected result>"
```

Examples:

* `"login - submit valid credentials - redirects to dashboard"`
* `"users table - server 500 - shows error banner"`

---

# 9. Error Case Requirements

For any server-backed feature:

* At least one happy-path test
* At least one failure-state test:

  * 401
  * 403
  * 500
  * or relevant domain error

Error state must assert:

* Toast message
* Error banner
* Disabled state
* Or redirect behavior

Silent failure is not acceptable.

---

# 10. Definition of Done – Route-Level Screens

A new route-level screen is considered automation-complete when:

* Screen root renders under mocked API
* Loading state is asserted
* Success state is asserted
* Error state is asserted (if server-backed)
* No unmocked network calls occur

---

# 11. Reliability Requirements

* Each spec must run independently
* No cross-test state dependencies
* No reliance on execution order
* Avoid duplicated mocking logic; prefer shared scenario helpers
* Smoke suite target runtime: under 3 minutes

---

# 12. CI Requirements

Repository must expose:

* `npm run test:e2e`
* CI must fail if UI Smoke suite fails
* Failure artifacts must be uploaded (trace, screenshots, video)

Lint and build checks remain mandatory.

---

# 13. Operating Principle

UI tests validate:

* User-visible behavior
* State transitions
* Contract integration boundaries

UI tests do not validate:

* Database logic
* Business rule correctness
* Internal implementation details

Keep automation aligned with architectural layering and existing domain boundaries.