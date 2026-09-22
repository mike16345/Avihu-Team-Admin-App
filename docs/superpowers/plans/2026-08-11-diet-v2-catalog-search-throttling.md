# Diet V2 Catalog Search Throttling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce Diet V2 catalog search traffic while preserving fast popular suggestions and immediate manual quick-add.

**Architecture:** Keep raw input local to `CatalogQuickAdd`, but increase its trailing debounce to 300 ms. The search query enforces the two-character boundary and forwards React Query's `AbortSignal` through the catalog API and shared Axios GET wrapper so obsolete requests terminate instead of completing in the background.

**Tech Stack:** React 18, TypeScript, TanStack React Query 5, Axios, Playwright.

## Global Constraints

- Remote search starts only after a normalized query contains at least two characters.
- Remote search waits for a 300 ms trailing pause.
- Obsolete in-flight searches are cancelled.
- Popular suggestions remain immediate when the input is empty.
- Enter and the Add button remain immediate for manual items.
- Existing React Query search caching remains unchanged.

---

### Task 1: Protect request-volume behavior with browser tests

**Files:**
- Modify: `frontend/tests/e2e/specs/dietPlans/dietV2Editor.spec.ts`

**Interfaces:**
- Consumes: the existing `openV2Editor()` helper and `/menuItems/v2/search` mock route.
- Produces: regression coverage for the two-character boundary and one trailing request per typing burst.

- [ ] **Step 1: Add failing request-volume tests**

Add request tracking for GET requests whose pathname ends in `/menuItems/v2/search`. Write one test that fills a single character, waits 350 ms, and expects zero search requests. Write a second test that uses `pressSequentially("chicken", { delay: 225 })`, waits until search settles, and expects exactly one request with `q=chicken` and `category=protein`.

```ts
test("V2 catalog search ignores one-character queries", async ({ page }) => {
  const requests: Request[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith("/menuItems/v2/search")) {
      requests.push(request);
    }
  });
  const { editor } = await openV2Editor(page);
  const input = editor
    .getByTestId("diet-v2-category-protein")
    .getByPlaceholder("חפש או כתוב מאכל ולחץ Enter…");

  await input.fill("c");
  await page.waitForTimeout(350);

  expect(requests).toHaveLength(0);
});

test("V2 catalog search sends only the settled term during typing", async ({ page }) => {
  const requests: Request[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith("/menuItems/v2/search")) {
      requests.push(request);
    }
  });
  const { editor } = await openV2Editor(page);
  const input = editor
    .getByTestId("diet-v2-category-protein")
    .getByPlaceholder("חפש או כתוב מאכל ולחץ Enter…");

  await input.pressSequentially("chicken", { delay: 225 });
  await expect.poll(() => requests.length).toBe(1);

  const url = new URL(requests[0].url());
  expect(url.searchParams.get("q")).toBe("chicken");
  expect(url.searchParams.get("category")).toBe("protein");
});
```

- [ ] **Step 2: Run both tests and verify RED**

Run:

```bash
cd frontend
npx playwright test tests/e2e/specs/dietPlans/dietV2Editor.spec.ts --project=chromium --workers=1 --grep "catalog search"
```

Expected: the one-character test observes a request after 175 ms, and the typing-burst test observes multiple intermediate requests.

### Task 2: Enforce the settled-search boundary and cancel stale requests

**Files:**
- Modify: `frontend/src/components/DietPlanV2/CatalogQuickAdd.tsx:33`
- Modify: `frontend/src/hooks/queries/dietV2Catalog/useDietV2CatalogSearchQuery.ts:7-16`
- Modify: `frontend/src/hooks/api/useDietV2CatalogApi.ts:17-21`
- Modify: `frontend/src/API/api.ts:5-31`

**Interfaces:**
- Consumes: `useDebouncedValue<T>(value, delay)` and TanStack Query's `queryFn` context signal.
- Produces: `searchItems(category, query, signal?)` and `fetchData(endpoint, params?, headers?, signal?)` with optional cancellation.

- [ ] **Step 1: Increase the trailing debounce**

Change the catalog input to:

```ts
const debouncedQuery = useDebouncedValue(query, 300);
```

- [ ] **Step 2: Enforce the two-character minimum and consume React Query cancellation**

Change the query options to:

```ts
return useQuery({
  queryKey: dietV2CatalogKeys.search(category, normalizedQuery),
  queryFn: ({ signal }) => searchItems(category, normalizedQuery, signal),
  enabled: normalizedQuery.length >= 2,
  placeholderData: keepPreviousData,
  staleTime: 5 * 60 * 1000,
});
```

- [ ] **Step 3: Pass the AbortSignal through the catalog API**

Change the method signature and GET call to:

```ts
const searchItems = (
  category: DietV2CatalogCategory,
  query: string,
  signal?: AbortSignal
) =>
  fetchData<ApiResponse<DietV2CatalogItem[]>>(
    `${ENDPOINT}/search`,
    { category, q: query },
    undefined,
    signal
  ).then((response) => response.data);
```

- [ ] **Step 4: Add optional signal support to the shared GET wrapper**

Extend only the internal request and GET signatures; all existing callers remain source-compatible:

```ts
async function request<T>(
  method: Method,
  endpoint: string,
  data?: any,
  params?: any,
  headers?: any,
  signal?: AbortSignal
): Promise<T> {
  const request: AxiosRequestConfig = {
    method,
    url: endpoint,
    data,
    params,
    headers,
    signal,
  };
  // existing request/error handling remains unchanged
}

export async function fetchData<T>(
  endpoint: string,
  params?: any,
  headers?: any,
  signal?: AbortSignal
): Promise<T> {
  return request<T>("get", endpoint, undefined, params, headers, signal);
}
```

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run:

```bash
cd frontend
npx playwright test tests/e2e/specs/dietPlans/dietV2Editor.spec.ts --project=chromium --workers=1 --grep "catalog search"
```

Expected: both tests pass, with zero requests for one character and one request containing the final term for the typing burst.

- [ ] **Step 6: Run scoped regression verification**

Run:

```bash
cd frontend
npx playwright test tests/e2e/specs/dietPlans/dietV2Editor.spec.ts tests/e2e/specs/dietPlans/dietV2ServerIntegration.spec.ts tests/e2e/specs/dietPlans/dietV2PresetServerIntegration.spec.ts --project=chromium --workers=4
npx eslint src/API/api.ts src/components/DietPlanV2/CatalogQuickAdd.tsx src/hooks/api/useDietV2CatalogApi.ts src/hooks/queries/dietV2Catalog/useDietV2CatalogSearchQuery.ts --ext ts,tsx --report-unused-disable-directives --max-warnings 0
npm run build
```

Expected: all scoped browser tests and ESLint pass; the production build exits successfully. Existing repository-wide TypeScript baseline failures remain outside this change.

- [ ] **Step 7: Commit the implementation**

```bash
git add frontend/src/API/api.ts frontend/src/components/DietPlanV2/CatalogQuickAdd.tsx frontend/src/hooks/api/useDietV2CatalogApi.ts frontend/src/hooks/queries/dietV2Catalog/useDietV2CatalogSearchQuery.ts frontend/tests/e2e/specs/dietPlans/dietV2Editor.spec.ts
git commit -m "perf: reduce diet catalog search requests"
```
