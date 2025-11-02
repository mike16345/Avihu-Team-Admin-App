# Adjusted to frontend/: Testing Strategy

## Overview
Playwright covers the authenticated admin flows that mutate data:
- Authentication (login success + failure handled in fixtures)
- Users table load states (empty vs populated)
- User creation (success) and deletion prevention on failure
- Error resilience for create mutation
- Navigation via sidebar test ids

Unit and integration tests remain in their respective layers (React Query hooks, utils). This document focuses on E2E coverage.

## Coverage map
| Feature | Positive coverage | Negative coverage |
| --- | --- | --- |
| Auth | `withLogin` helper signs in with env credentials | Fixture returns 401 (`mockAuthFailure`) to validate `alert-error` |
| Users list | `entities.load.spec` asserts `empty-state` and rows (`row-<id>`) | `mockUsersError` ready to surface `alert-error` if GET fails |
| Create user | `entities.create.spec` fills `form-field-*`, waits for `toast-success`, verifies new `row-<id>` | `entities.error.spec` forces 500, checks `alert-error`, submit button re-enabled, row absent |
| Routing | POM navigates through `/users`, ensures nav link `nav-users-link` visible post-login | Back to list after failure confirms state resets |
| Directionality | App renders in RTL by default; selectors rely on test ids so they remain stable for LTR/RTL |

## Selector policy
- Always prefer `getByTestId` with the ids declared in `tests/helpers/ids.ts`
- Never rely on text except for temporary option selection inside Radix Select components
- If a new primitive is added, expose `'data-testid'` pass-throughs at the component level

## Flake management
- No arbitrary sleeps; rely on `waitForLoadState`, `expect(locator).toBeVisible()`
- Retries enabled only in CI (`retries: 2`)
- Keep network interceptors deterministic (fixtures return stable IDs)
- Investigate and fix flaky selectors before bumping retries locally

## Adding scenarios
1. Extend fixtures with the dataset / error payload you need
2. Update POMs with high-level flows to keep specs declarative
3. Place new specs under `tests/e2e/` and name `<feature>.<case>.spec.ts`
4. Document additions in this matrix to keep QA & dev alignment
