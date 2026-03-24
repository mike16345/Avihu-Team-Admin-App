# E2E Testing Guide

This repository uses Playwright for end-to-end tests.

The tests are designed to be:

- deterministic
- fast
- independent from the real backend
- safe to run across Chromium, Firefox, and WebKit

The current setup uses a local mock API layer under `tests/e2e/utils/mockApi` instead of making real network requests.

This guide explains exactly how to add new tests, where each file belongs, and how to structure the UI so it is easy to test.

## 1. What Exists Today

The relevant folders are:

- `tests/e2e/specs`
  - Playwright spec files live here.
  - Each file usually maps to a page or a major flow.
- `tests/e2e/mocks`
  - JSON fixtures live in `tests/e2e/mocks/fixtures/<name>.json`.
  - Each fixture file contains named variants such as `success`, `empty`, or `error_server`.
- `tests/e2e/utils/mockApi`
  - The mock API engine lives here.
  - This is where route matching, scenario registration, and per-test scenario switching happen.
- `playwright.config.ts`
  - Global Playwright configuration.
  - This repo already runs tests for Chromium, Firefox, and WebKit.

Examples already in the repo:

- `tests/e2e/specs/login.spec.ts`
- `tests/e2e/specs/adminDashboard.spec.ts`
- `tests/e2e/specs/users.spec.ts`
- `tests/e2e/utils/mockApi/scenarios/users.ts`
- `tests/e2e/mocks/fixtures/users.collection.json`

## 2. High-Level Testing Flow

When you add a new e2e test in this repo, the normal flow is:

1. Identify the page or flow to test.
2. Inspect the real route, page, hooks, and API calls used by that page.
3. Add stable selectors to the UI if the page does not already expose good test hooks.
4. Create JSON mock fixtures for all needed backend responses.
5. Register those fixtures as mock scenarios.
6. Write Playwright tests that activate those scenarios.
7. Run the tests locally.
8. Keep the tests browser-safe and timing-safe.

That is the standard pattern used in this codebase.

## 3. Where Files Need To Go

### 3.1 Spec files

Put Playwright test files in:

- `tests/e2e/specs/<feature>.spec.ts`

Examples:

- `tests/e2e/specs/users.spec.ts`
- `tests/e2e/specs/login.spec.ts`

Use one spec file per page or per major user flow.

Good examples:

- `users.spec.ts`
- `leads.spec.ts`
- `agreements.spec.ts`

Avoid:

- putting test files under `src`
- mixing multiple unrelated pages into one giant spec file

### 3.2 JSON fixtures

Put JSON fixtures under:

- `tests/e2e/mocks/fixtures/<name>.json`

Examples:

- `tests/e2e/mocks/fixtures/users.collection.json`
- `tests/e2e/mocks/fixtures/users.one.json`
- `tests/e2e/mocks/fixtures/auth.login.json`

Each fixture file should group variants for the same endpoint or response family.

Example:

```json
{
  "success": {
    "data": [],
    "message": "Users loaded"
  },
  "error_server": {
    "data": null,
    "message": "Server error"
  }
}
```

The mock loader resolves these with `jsonFixtureRoute({ fixture: "users.collection", variant: "success" })`.

### 3.3 Mock scenario registration

After creating fixtures, register them in:

- `tests/e2e/utils/mockApi/scenarios/<domain>.ts`

Examples:

- `tests/e2e/utils/mockApi/scenarios/users.ts`
- `tests/e2e/utils/mockApi/scenarios/auth.ts`

This is where fixture files become named scenarios that tests can enable.

### 3.4 Shared mock infrastructure

Do not put page-specific logic directly into the global mock engine unless you are improving the framework itself.

Framework files:

- `tests/e2e/utils/mockApi/index.ts`
- `tests/e2e/utils/mockApi/registry.ts`
- `tests/e2e/utils/mockApi/routes.ts`

Only edit these when you need a capability that multiple features can reuse, such as:

- delayed responses
- custom status overrides
- simulated network failures
- runtime scenario switching

## 4. How To Add Test IDs In The UI

Playwright is most stable when it can use:

- `getByRole(...)`
- `getByText(...)`
- `getByLabel(...)`
- `getByTestId(...)`

In this repository, `data-testid` is the preferred fallback when text or role selectors are not stable enough.

### 4.1 When to add a `data-testid`

Add a `data-testid` when:

- the element has no clear accessible role/name
- the text can change because of localization
- the page is RTL and visible text may be harder to use safely
- there are repeated controls in rows, cards, or menus
- a selector needs to target one specific record by ID

Examples:

- table wrappers
- row action menu buttons
- row-level switches
- search inputs
- modal confirm/cancel buttons
- pagination buttons

### 4.2 Where to add a `data-testid`

Add the attribute directly on the interactive or container element in the React component.

Good examples from this repo:

- `data-testid="users-table"`
- `data-testid="users-search"`
- `data-testid="users-row-user-001"`
- `data-testid="users-access-switch-user-001"`
- `data-testid="delete-modal-confirm"`

### 4.3 How to name a `data-testid`

Use names that are:

- specific
- readable
- stable
- tied to the UI purpose, not styling

Good patterns:

- `<page>-table`
- `<page>-search`
- `<page>-add-button`
- `<page>-next-page`
- `<page>-row-<id>`
- `<page>-row-menu-<id>`

Good:

- `users-table`
- `users-row-user-001`
- `sidebar-link-users`

Bad:

- `blue-button`
- `left-icon`
- `div-1`
- `row-3`

Do not base test IDs on:

- CSS classes
- layout position
- visual order only

### 4.4 Where not to add a `data-testid`

Do not add test IDs everywhere by default.

Avoid adding them to:

- purely decorative wrappers
- non-essential layout containers
- elements that already have strong role/label selectors

The goal is stable tests, not noisy markup.

## 5. How To Create Mock Fixtures

Every page test in this repo should use mocked backend responses.

Do not call the real backend.

### 5.1 Pick the fixture file name

If you are testing the users list page:

- use a file like `tests/e2e/mocks/fixtures/users.collection.json`

If you are testing login:

- use a file like `tests/e2e/mocks/fixtures/auth.login.json`

If you are testing a new domain:

1. Create a new file under `tests/e2e/mocks/fixtures/<name>.json`.
2. Group related response variants for that endpoint in the same file.

### 5.2 Create named variants inside that file

Use clear variant names:

- `success`
- `empty`
- `large`
- `error_bad_request`
- `error_unauthorized`
- `error_forbidden`
- `error_not_found`
- `error_server`
- `malformed`

For mutations, create dedicated variants when helpful:

- `create_success`
- `update_success`
- `delete_success`

Example path and structure:

- `tests/e2e/mocks/fixtures/users.collection.json`

```json
{
  "success": {
    "data": [
      {
        "_id": "user-001",
        "firstName": "Alice"
      }
    ],
    "message": "Users loaded"
  },
  "empty": {
    "data": [],
    "message": "No users found"
  },
  "error_server": {
    "data": null,
    "message": "Server error"
  }
}
```

### 5.3 Match the real backend shape

Keep the fixture shape consistent with the real API.

This codebase commonly expects:

- `ApiResponse<T>`

That usually looks like:

```json
{
  "data": [],
  "message": "Users loaded"
}
```

If the real code expects `res.data`, your mock must return a body with `data`.

If the real code expects `res.data.data`, your mock must match that shape instead.

Always inspect the actual hook before creating fixtures.

## 6. How To Register Mock Scenarios

Fixtures are not enough by themselves.

Tests use named scenarios, and those scenarios must be declared in:

- `tests/e2e/utils/mockApi/scenarios/<domain>.ts`

### 6.1 Basic pattern

You load the fixture and bind it to:

- an HTTP method
- a pathname
- a scenario key

Typical pattern:

```ts
import { jsonFixtureRoute, type MockScenarioMap } from "../routes";

export const sampleScenarios = {
  "sample.success": [
    jsonFixtureRoute({
      method: "GET",
      pathname: "/sample",
      fixture: "sample.collection",
      variant: "success",
    }),
  ],
} satisfies MockScenarioMap;
```

### 6.2 Naming scenarios

Scenario keys should be:

- short
- descriptive
- grouped by domain

Good examples:

- `users.success`
- `users.empty`
- `users.error-500`
- `auth.login.success`

### 6.3 Advanced scenarios

The current mock engine supports:

- standard JSON responses
- custom HTTP status codes
- delayed responses
- aborted requests for network failure simulation
- runtime scenario switching inside a single test

This allows patterns like:

```ts
mockApi.useScenario("users.success");
mockApi.useScenario({ key: "users.success", overrides: { delayMs: 800 } });
mockApi.useScenario("users.error-500");
```

Use that to test:

- loading states
- error transitions
- post-mutation refreshes

## 7. How To Write The Spec File

Put the spec in:

- `tests/e2e/specs/<page>.spec.ts`

### 7.1 Recommended structure

Use:

- small helper functions at the top
- `test.describe(...)` blocks grouped by behavior
- focused tests with one main assertion set per case

Good section structure:

- routing and entry
- data states
- interactions
- permissions

### 7.2 Common helper patterns

Helpers make tests easier to read and reduce duplication.

Typical helpers:

- login helper
- page open helper
- request tracking helper
- locator helper

Example:

```ts
const getUserRow = (page: Page, userId: string) =>
  page.getByTestId(`users-row-${userId}`);
```

### 7.3 Install the mock API first

Before navigating to a page, install the mock API.

Typical pattern:

```ts
const mockApi = await installMockApi(page);
mockApi.useScenario("auth.login.success", "analytics.dashboard.success");
```

Do this before:

- `page.goto(...)`
- clicking a link that triggers API calls

If the page fires an API call and no matching route is mocked, the test should fail.

That is intentional. It protects test determinism.

### 7.4 Navigate after mocks are ready

Once the needed scenarios are active:

```ts
await page.goto("/users", { waitUntil: "domcontentloaded" });
```

In this repo, `waitUntil: "domcontentloaded"` is a safer default than waiting for full `load` on every page.

### 7.5 Use stable assertions

Prefer:

- `await expect(locator).toBeVisible()`
- `await expect(locator).toHaveCount(...)`
- `await expect(page).toHaveURL(...)`
- `await expect.poll(...)`

Avoid:

- `waitForTimeout(...)`
- arbitrary sleeps
- assumptions about animation timing

## 8. What To Test

Each page should be tested from multiple angles.

At minimum, cover:

### 8.1 Routing and entry

- direct navigation
- navigation via UI
- auth guard behavior
- URL parameter normalization
- back/forward behavior when applicable

### 8.2 Data states

For each endpoint used by the page, cover:

- success
- empty state
- loading state
- malformed response
- 400
- 401
- 403
- 404
- 500
- network failure

### 8.3 User interactions

For each important action, cover:

- happy path
- disabled state while request is pending
- cancel flow for destructive actions
- post-success refresh
- error handling if the mutation fails

### 8.4 Edge cases

If the page makes sense for it, also cover:

- large datasets
- long strings
- special characters
- keyboard navigation
- modal focus behavior
- RTL rendering assumptions

## 9. Selector Rules: What To Prefer And What To Avoid

### 9.1 Prefer these selectors

Best:

- `getByRole(...)`
- `getByLabel(...)`
- `getByPlaceholder(...)`
- `getByTestId(...)`

Safe when text is stable:

- `getByText(...)`

### 9.2 Avoid these selectors

Do not rely on:

- `.class-name`
- long chained CSS selectors
- `nth-child(...)`
- exact DOM nesting
- visual position

Bad example:

```ts
page.locator("table > tbody > tr:nth-child(2) > td:nth-child(4)");
```

That is fragile and often breaks after harmless UI changes.

## 10. How To Test Loading States

Use delayed mock responses.

Example:

```ts
mockApi.useScenario({
  key: "users.success",
  overrides: { delayMs: 800 },
});
```

Then assert:

1. The loader appears.
2. The final UI appears after the response resolves.

Good pattern:

```ts
await expect(page.getByTestId("loader")).toBeVisible();
await expect(page.getByTestId("users-table")).toBeVisible();
```

Do not use:

```ts
await page.waitForTimeout(800);
```

## 11. How To Test Errors

### 11.1 Server error

Use an error scenario like:

- `users.error-500`

Then assert the page renders its error UI.

### 11.2 Network failure

Use an aborted route scenario.

This simulates a failed request more accurately than returning a JSON 500 response.

Then assert:

- error UI is shown
- no unhandled request remains

## 12. How To Test Mutations

Mutations often require more than one scenario.

Example: deleting a user may require:

- a pre-check request
- the delete request itself
- a follow-up list refresh

A typical test flow is:

1. Load the page with the initial list scenario.
2. Switch the mock API to the mutation scenarios.
3. Perform the user action.
4. Assert the requests happened.
5. Assert the UI updated.

This is exactly why the mock API supports runtime `useScenario(...)`.

## 13. How To Track Requests In A Test

When you want to prove a request was sent, track it explicitly.

Pattern:

```ts
const requests: Request[] = [];

page.on("request", (request) => {
  if (request.method() === "DELETE") {
    requests.push(request);
  }
});
```

Then assert:

```ts
await expect.poll(() => requests.length).toBe(1);
```

This is better than assuming the click definitely triggered the request.

## 14. Cross-Browser Rules

This repo is configured to run:

- Chromium
- Firefox
- WebKit

Write tests so they are safe in all three.

### 14.1 Do

- use accessible selectors
- wait for actual state changes
- use `expect.poll(...)` when timing can vary
- use `toBeVisible()` and `toHaveURL()`
- keep tests independent

### 14.2 Do not

- depend on pixel layout
- assume animation timing is identical in all browsers
- assume focus behavior based on one engine only
- use browser-specific branches unless absolutely necessary

If a test fails in one engine:

1. inspect whether the selector is too brittle
2. inspect whether the wait strategy is too weak
3. fix the test to be engine-safe
4. only use skip logic as a last resort

## 15. Running Tests Locally

### 15.1 Run all Playwright tests

```bash
npm run test:e2e
```

### 15.2 Run one spec file

```bash
npx playwright test users.spec.ts
```

### 15.3 Run one browser

```bash
npx playwright test users.spec.ts --project=chromium
```

### 15.4 Run one test group

```bash
npx playwright test users.spec.ts -g "users page interactions"
```

### 15.5 List discovered tests

```bash
npx playwright test --list users.spec.ts
```

This is useful when you want to confirm Playwright is finding the spec you just added.

## 16. Step-By-Step Example: Adding A New Page Test

Here is the recommended exact process.

### Step 1: Inspect the page

Read:

- the route file
- the page component
- the data hook
- the API wrapper
- any mutation hooks

Find:

- which endpoints are called
- which loading states exist
- which error states exist
- which actions the user can take

### Step 2: Add missing test hooks

If the page does not expose stable selectors:

1. add `data-testid` attributes
2. place them on meaningful controls
3. use descriptive names

Examples:

- search input
- table wrapper
- modal buttons
- row action menu

### Step 3: Create mock fixtures

Under `tests/e2e/mocks/fixtures/<name>.json`:

1. add a `success` variant
2. add an `empty` variant if needed
3. add `error_*` variants for expected failures
4. add mutation variants if needed

### Step 4: Register mock scenarios

Under `tests/e2e/utils/mockApi/scenarios/<domain>.ts`:

1. load each fixture
2. bind each one to the correct method/path
3. export named scenarios

### Step 5: Write the spec

Under `tests/e2e/specs/<page>.spec.ts`:

1. create helpers
2. install mock API
3. activate scenarios
4. navigate to the page
5. assert the UI
6. add interaction tests

### Step 6: Add data-state coverage

Make sure the spec includes:

- success
- empty
- loading
- error responses
- network failure

### Step 7: Add mutation coverage

For each major action:

- test open/cancel if destructive
- test confirm/success
- test disabled state during pending request

### Step 8: Run the tests

Start with:

```bash
npx playwright test <your-spec>.spec.ts --project=chromium
```

Then run:

```bash
npx playwright test <your-spec>.spec.ts --project=firefox
npx playwright test <your-spec>.spec.ts --project=webkit
```

If the suite is large, run specific groups first with `-g`.

### Step 9: Fix flakiness before merging

If a test is unstable:

- improve selectors
- improve waits
- remove timing assumptions
- reduce cross-test coupling

Do not patch instability with `waitForTimeout(...)`.

## 17. Common Mistakes To Avoid

- Forgetting to mock one of the page's API requests
- Creating fixtures that do not match the real API shape
- Using visible text that is likely to change
- Using selectors tied to layout order
- Reusing state between tests
- Testing too many behaviors in one test
- Writing tests that only pass in Chromium
- Relying on arbitrary delays

## 18. Good Test Checklist

Before you consider a test ready, confirm:

- the spec file is in `tests/e2e/specs`
- the fixtures are in `tests/e2e/mocks/fixtures/<name>.json`
- the scenario keys are registered
- all backend calls are mocked
- selectors are stable
- there are no `waitForTimeout(...)` calls
- the test passes repeatedly
- the test is safe in Chromium, Firefox, and WebKit

## 19. If You Need To Extend The Test Framework

If a page needs something the current mock engine does not support:

1. add the capability in `tests/e2e/utils/mockApi/routes.ts` or `tests/e2e/utils/mockApi/index.ts`
2. keep the new behavior generic
3. reuse it in the page test
4. do not hard-code page-specific logic into the shared engine

Examples of acceptable framework improvements:

- new override options
- improved request matching
- new reusable helper utilities

## 20. Recommended Starting Point

If you are creating a new test and are not sure where to begin:

1. copy the structure of `tests/e2e/specs/users.spec.ts`
2. create your fixtures
3. register your scenarios
4. add the minimum test IDs needed
5. build out routing, data-state, and interaction coverage

That follows the repository's current testing pattern and is the safest path.
