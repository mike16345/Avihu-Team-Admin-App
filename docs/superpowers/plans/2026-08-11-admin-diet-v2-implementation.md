# Admin Diet Plan V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Admin V2 nutrition-item prototype with a fast category-scoped quick-add editor using required meal macros, server-ready catalog contracts, and React Hook Form dirty-state saves.

**Architecture:** Keep the existing `DietPlanV2` component boundary and visual language, but replace item nutrition state with literal name snapshots. Server-owned catalog data flows through a resource API wrapper, TanStack Query hooks, and focused UI consumers; form-owned plan data flows through React Hook Form and Zod. Pure catalog normalization and plan-total helpers remain feature-local and independently testable through the existing Playwright runner.

**Tech Stack:** React 18, TypeScript strict mode, React Hook Form, Zod, TanStack Query, Tailwind CSS, Playwright, Vite.

## Global Constraints

- Preserve the existing Hebrew RTL visual language and meal-card layout; the result should look like a refinement of Avihu's design.
- V2 food entries contain literal names only: no quantity, unit, item macros, parsing, estimation, or scaling.
- All meal calories, protein, carbohydrates, and fat fields are required, numeric, non-negative, and allow zero.
- Catalog uniqueness is scoped by owning `trainerId + category + normalizedName`.
- The same name may exist across categories and across trainer catalogs.
- Free-calorie descriptions participate in the catalog under `freeCalories`; their numeric allowance remains meal-specific.
- Highlights remain a plan-level plain string.
- Supplements remain a provisional optional meal-level `string[]`; do not add parsing or Client assumptions.
- V1 contracts and behavior must remain unchanged.
- Follow `frontend/Agents.md`: API wrapper -> query/mutation hook -> component, no direct component HTTP calls, modular files, sparse comments, and targeted edits.

---

### Task 1: Canonical V2 contracts, schema, and pure helpers

**Files:**
- Modify: `frontend/src/interfaces/IDietPlanV2.ts`
- Create: `frontend/src/schemas/dietPlanV2Schema.ts`
- Create: `frontend/src/components/DietPlanV2/dietPlanV2Catalog.ts`
- Modify: `frontend/src/components/DietPlanV2/dietPlanV2Utils.ts`
- Replace test: `frontend/tests/e2e/specs/dietPlans/dietV2RecentFoods.spec.ts`

**Interfaces:**
- Produces: `IDietPlanV2`, `DietV2Meal`, `DietV2Category`, `DietV2PlanItem`, `IMacros`, `DietV2FreeCalories`, `DietV2CatalogItem`, `DietV2CatalogCategory`.
- Produces: `dietPlanV2Schema`, `normalizeCatalogName(name)`, `hasCategoryDuplicate(items, name)`, `dedupeCatalogCandidates(candidates)`, `buildEmptyMeal(index)`, and `computePlanTotals(plan)`.

- [ ] **Step 1: Replace the obsolete recent-food tests with failing contract/helper tests**

```ts
import { expect, test } from "@playwright/test";
import {
  dedupeCatalogCandidates,
  hasCategoryDuplicate,
  normalizeCatalogName,
} from "../../../../src/components/DietPlanV2/dietPlanV2Catalog";
import { dietPlanV2Schema } from "../../../../src/schemas/dietPlanV2Schema";

test("catalog names normalize whitespace and case", () => {
  expect(normalizeCatalogName("  100G   Chicken Breast ")).toBe("100g chicken breast");
});

test("duplicates are blocked only inside the same category", () => {
  expect(hasCategoryDuplicate([{ name: "Rice" }], " rice ")).toBe(true);
  expect(
    dedupeCatalogCandidates([
      { name: "Rice", category: "carbs" },
      { name: " rice ", category: "carbs" },
      { name: "Rice", category: "protein" },
    ])
  ).toHaveLength(2);
});

test("meal macros are required and non-negative", () => {
  const result = dietPlanV2Schema.safeParse({
    version: 2,
    highlights: "",
    meals: [{ id: "meal-1", name: "Meal 1", categories: [], macros: { calories: 0 } }],
  });
  expect(result.success).toBe(false);
});
```

- [ ] **Step 2: Run the focused test and verify the new imports fail**

Run: `cd frontend && npx playwright test tests/e2e/specs/dietPlans/dietV2RecentFoods.spec.ts --project=chromium`

Expected: FAIL because `dietPlanV2Catalog.ts` and `dietPlanV2Schema.ts` do not exist.

- [ ] **Step 3: Replace the V2 contracts and add schema/helpers**

Implement the approved interfaces exactly, using `category` rather than `kind`. `dietPlanV2Schema` must validate required meal macros, literal names, optional `{ calories, description }` free calories, optional meal `supplements: string[]`, and plan-level `highlights`.

```ts
export const normalizeCatalogName = (name: string): string =>
  name.trim().replace(/\s+/g, " ").toLocaleLowerCase();

export const hasCategoryDuplicate = (
  items: Pick<DietV2PlanItem, "name">[],
  candidateName: string
): boolean => {
  const candidate = normalizeCatalogName(candidateName);
  return items.some((item) => normalizeCatalogName(item.name) === candidate);
};
```

Update `buildEmptyMeal` to create the five normal categories, zeroed required macros, and no free-calorie block. Replace category-derived macro helpers with explicit meal-macro summation helpers.

Mechanically migrate every direct V2 consumer needed to keep TypeScript compiling: use
`category.category`, `category.items`, and `meal.macros`; remove quantity/unit/item-macro property
access. Do not add compatibility aliases for obsolete fields.

- [ ] **Step 4: Run the focused tests and TypeScript build**

Run: `cd frontend && npx playwright test tests/e2e/specs/dietPlans/dietV2RecentFoods.spec.ts --project=chromium && npm run build`

Expected: helper/schema tests PASS and the build exits zero. Do not commit a partially migrated V2
contract.

- [ ] **Step 5: Commit the contract slice**

```bash
git add frontend/src/interfaces/IDietPlanV2.ts frontend/src/schemas/dietPlanV2Schema.ts frontend/src/components/DietPlanV2/dietPlanV2Catalog.ts frontend/src/components/DietPlanV2/dietPlanV2Utils.ts frontend/tests/e2e/specs/dietPlans/dietV2RecentFoods.spec.ts
git commit -m "refactor(dietPlanV2): define quick-add plan contract"
```

### Task 2: Catalog API, queries, and deletion mutation

**Files:**
- Create: `frontend/src/hooks/api/useDietV2CatalogApi.ts`
- Create: `frontend/src/hooks/queries/dietV2Catalog/dietV2CatalogKeys.ts`
- Create: `frontend/src/hooks/queries/dietV2Catalog/useDietV2PopularItemsQuery.ts`
- Create: `frontend/src/hooks/queries/dietV2Catalog/useDietV2CatalogSearchQuery.ts`
- Create: `frontend/src/hooks/mutations/dietV2Catalog/useDeleteDietV2CatalogItem.ts`
- Test: `frontend/tests/e2e/specs/dietPlans/dietV2CatalogApi.spec.ts`

**Interfaces:**
- Consumes: `DietV2CatalogCategory`, `DietV2CatalogItem` from Task 1.
- Produces: `DietV2PopularItemsByCategory`, API methods `getPopularItems`, `searchItems`, `deleteItem`, and stable query-key factories.

- [ ] **Step 1: Write failing API-wrapper contract tests**

Use the existing Playwright request interception helpers to assert these requests:

```text
GET /menuItems/v2/popular
GET /menuItems/v2/search?category=protein&q=chicken
DELETE /menuItems/v2/one?id=<catalog-id>
```

Verify the search query remains disabled for an empty category, and popular results are represented as a category-keyed record.

- [ ] **Step 2: Run the catalog API spec and verify failure**

Run: `cd frontend && npx playwright test tests/e2e/specs/dietPlans/dietV2CatalogApi.spec.ts --project=chromium`

Expected: FAIL because the catalog API and hooks do not exist.

- [ ] **Step 3: Implement the resource wrapper and TanStack Query hooks**

Use `fetchData` and `deleteItem` from `@/API/api`. Search accepts `{ category, query }`, passes `category` and `q` params, and unwraps `ApiResponse<T>.data`. Query keys include category plus normalized query. The search hook accepts a debounced query and uses `enabled: !!category && !!query.trim()`.

The delete mutation invalidates popular and search keys on success, shows the existing Hebrew success toast, and shows the shared generic error toast on failure.

- [ ] **Step 4: Run the catalog API spec**

Run: `cd frontend && npx playwright test tests/e2e/specs/dietPlans/dietV2CatalogApi.spec.ts --project=chromium`

Expected: PASS with no unhandled requests.

- [ ] **Step 5: Commit the catalog data layer**

```bash
git add frontend/src/hooks/api/useDietV2CatalogApi.ts frontend/src/hooks/queries/dietV2Catalog frontend/src/hooks/mutations/dietV2Catalog frontend/tests/e2e/specs/dietPlans/dietV2CatalogApi.spec.ts
git commit -m "feat(dietPlanV2): add catalog data layer"
```

### Task 3: Fast category quick add and catalog suggestions

**Files:**
- Create: `frontend/src/components/DietPlanV2/CatalogSuggestions.tsx`
- Create: `frontend/src/hooks/useDebouncedValue.ts`
- Modify: `frontend/src/components/DietPlanV2/CategorySection.tsx`
- Modify: `frontend/src/components/DietPlanV2/OptionRow.tsx`
- Modify: `frontend/src/components/DietPlanV2/CopyCategoryButton.tsx`
- Delete: `frontend/src/components/DietPlanV2/ManualFoodDialog.tsx`
- Delete: `frontend/src/components/DietPlanV2/CategoryHeaderMacros.tsx`
- Delete: `frontend/src/components/DietPlanV2/dietPlanV2RecentFoods.ts`
- Test: `frontend/tests/e2e/specs/dietPlans/dietV2QuickAdd.spec.ts`

**Interfaces:**
- Consumes: catalog hooks and helpers from Tasks 1-2.
- Produces: a controlled `CategorySection` that edits only `DietV2Category.items` and provides `CatalogSuggestions` with add and confirmed-delete actions.

- [ ] **Step 1: Write failing quick-add UI tests**

Cover these behaviors through a V2 editor fixture:

```ts
await categoryInput.fill("chicken");
await expect(page.getByText("100g Chicken breast")).toBeVisible();
await page.getByText("100g Chicken breast").click();
await expect(categoryItems).toContainText("100g Chicken breast");

await categoryInput.fill("200 grams chicken breast");
await categoryInput.press("Enter");
await expect(categoryItems).toContainText("200 grams chicken breast");
```

Also verify same-category normalized duplicates show Hebrew feedback, another category may contain the same name, items render separated by `/`, and catalog deletion opens a confirmation containing the exact name.

- [ ] **Step 2: Run the quick-add spec and verify failure**

Run: `cd frontend && npx playwright test tests/e2e/specs/dietPlans/dietV2QuickAdd.spec.ts --project=chromium`

Expected: FAIL because the old dialog, quantities, units, and item macros remain.

- [ ] **Step 3: Implement the controlled quick-add UI**

Preserve the current rounded category row, colored category chip, compact search field, and option-card tones. Replace `OptionRow` with a literal-name chip/row containing only the snapshot name and remove action. `CatalogSuggestions` shows popular entries for an empty input and debounced search results for typed input.

Use a 175 ms debounce. Keep prior results rendered during query transitions. Enter quick-add trims only outer whitespace for display, preserves internal trainer text, uses `hasCategoryDuplicate`, and clears the field after successful add.

Catalog suggestion deletion must reuse `DeleteModal`; no custom modal implementation. Removing a suggestion from the catalog does not remove plan items.

- [ ] **Step 4: Run the quick-add spec and build**

Run: `cd frontend && npx playwright test tests/e2e/specs/dietPlans/dietV2QuickAdd.spec.ts --project=chromium && npm run build`

Expected: PASS; no V2 UI imports the three deleted obsolete files.

- [ ] **Step 5: Commit the quick-add UI**

```bash
git add frontend/src/components/DietPlanV2 frontend/src/hooks/useDebouncedValue.ts frontend/tests/e2e/specs/dietPlans/dietV2QuickAdd.spec.ts
git commit -m "feat(dietPlanV2): simplify category quick add"
```

### Task 4: Meal macros, free calories, and refined meal-card layout

**Files:**
- Create: `frontend/src/components/DietPlanV2/MealMacroFields.tsx`
- Create: `frontend/src/components/DietPlanV2/FreeCaloriesFields.tsx`
- Modify: `frontend/src/components/DietPlanV2/MealCard.tsx`
- Modify: `frontend/src/components/DietPlanV2/PlanMacroCharts.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2TraineeView.tsx`
- Test: `frontend/tests/e2e/specs/dietPlans/dietV2MealFields.spec.ts`

**Interfaces:**
- Consumes: `DietV2Meal`, `IMacros`, `DietV2FreeCalories`, and explicit total helpers from Task 1.
- Produces: focused controlled field components with inline validation-compatible inputs.

- [ ] **Step 1: Write failing meal-field UI tests**

Verify every expanded meal shows four labeled inputs; missing/negative values block Save; zero is valid; item changes do not change meal macros; free calories show separate calorie and description fields; and the collapsed header renders normal calories plus a separate free-calorie badge.

- [ ] **Step 2: Run the meal-field spec and verify failure**

Run: `cd frontend && npx playwright test tests/e2e/specs/dietPlans/dietV2MealFields.spec.ts --project=chromium`

Expected: FAIL because meal values are still derived from category option macros.

- [ ] **Step 3: Implement the refined meal fields**

Place `MealMacroFields` directly beneath the meal header in a compact four-column desktop grid that collapses cleanly on narrow widths. Use the established blue/slate cards, Hebrew labels, strong numeric hierarchy, and visible focus states. Keep the meal header summary compact.

Place `FreeCaloriesFields` after normal categories as a visually distinct dashed green/emerald block matching the Client badge. Its description quick-add uses the `freeCalories` catalog category, while its calorie number remains plan-only.

Update charts and trainee preview helpers to sum `meal.macros`; keep free calories as a separately computed total.

- [ ] **Step 4: Run the meal-field spec and build**

Run: `cd frontend && npx playwright test tests/e2e/specs/dietPlans/dietV2MealFields.spec.ts --project=chromium && npm run build`

Expected: PASS with no category-derived macro calculation references.

- [ ] **Step 5: Commit the meal presentation**

```bash
git add frontend/src/components/DietPlanV2 frontend/tests/e2e/specs/dietPlans/dietV2MealFields.spec.ts
git commit -m "feat(dietPlanV2): add manual meal macros"
```

### Task 5: React Hook Form editor and save payload

**Files:**
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2Editor.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2TemplatePlanEditor.tsx`
- Modify: `frontend/src/components/DietPlanV2/dietPlanV2Templates.ts`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2TemplateSaveDialog.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2TemplatePickerDialog.tsx`
- Test: `frontend/tests/e2e/specs/dietPlans/dietV2SaveState.spec.ts`

**Interfaces:**
- Consumes: `IDietPlanV2`, `IDietPlanV2Preset`, `dietPlanV2Schema`, and controlled meal/category components.
- Produces: `DietPlanV2Editor` backed by `useForm<IDietPlanV2>` and an `onPersist(plan)` contract containing new catalog candidates through missing `catalogItemId` values.

- [ ] **Step 1: Write failing save-state tests**

Verify Save begins disabled, editing any meaningful field enables it, validation errors prevent persistence, a failed save preserves values and enabled state, and a successful save calls the route once then returns Save to disabled. Verify a newly typed item appears in the submitted plan without `catalogItemId`, while a selected suggestion includes it.

- [ ] **Step 2: Run the save-state spec and verify failure**

Run: `cd frontend && npx playwright test tests/e2e/specs/dietPlans/dietV2SaveState.spec.ts --project=chromium`

Expected: FAIL because the editor uses local `saved` state rather than React Hook Form dirtiness.

- [ ] **Step 3: Convert the editor to React Hook Form**

Use `useForm<IDietPlanV2>({ resolver: zodResolver(dietPlanV2Schema), defaultValues })`, `FormProvider`, `useFieldArray` for meals, and controlled `setValue` calls with `shouldDirty: true`. Keep drag/collapse/dialog state local because it is UI state, not plan data.

Disable Save when `!isDirty || isSubmitting`. Await `onPersist`; on success call `reset(savedPlan)`. Preserve values on rejection and surface the existing generic toast. Continue using `useUnsavedChangesWarning(isDirty)`.

Template cloning regenerates local meal IDs but preserves literal names and resolved catalog references.

- [ ] **Step 4: Run save-state, helper, and build checks**

Run: `cd frontend && npx playwright test tests/e2e/specs/dietPlans/dietV2SaveState.spec.ts tests/e2e/specs/dietPlans/dietV2RecentFoods.spec.ts --project=chromium && npm run build`

Expected: PASS.

- [ ] **Step 5: Commit the form-state migration**

```bash
git add frontend/src/components/DietPlanV2 frontend/tests/e2e/specs/dietPlans/dietV2SaveState.spec.ts
git commit -m "refactor(dietPlanV2): use dirty form saves"
```

### Task 6: V2 presets-only page, cleanup, and regression verification

**Files:**
- Modify: `frontend/src/pages/DietPlanTemplatePage.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2TemplatesList.tsx`
- Modify: `frontend/tests/e2e/specs/dietPlans.spec.ts`
- Delete when unreferenced: `frontend/src/components/DietPlanV2/dietPlanV2Supplements.ts`
- Modify only if repeated patterns require it: `frontend/Agents.md`

**Interfaces:**
- Consumes: completed V2 preset and editor contracts.
- Produces: V2 trainer route behavior that never instantiates legacy food-group tabs or mutations.

- [ ] **Step 1: Add failing V2 route regression coverage**

Add a V2 authenticated-user fixture and verify `/dietPlans` shows the V2 presets list, does not show protein/carbohydrate/vegetable/fat tabs, and does not issue legacy food-group requests. Preserve all existing V1 route assertions.

- [ ] **Step 2: Run the route spec and verify failure**

Run: `cd frontend && npx playwright test tests/e2e/specs/dietPlans.spec.ts --project=chromium`

Expected: the new V2 assertions fail until the route cleanly branches before legacy menu-item setup.

- [ ] **Step 3: Isolate V2 routing and remove dead code**

Split V1-only menu-item mutations and tab construction away from the V2 render path so V2 trainers see presets only. Remove all imports, files, types, local-storage keys, comments, and helpers used only by quantity/unit/item-macro or structured-supplement behavior. Do not refactor unrelated V1 components.

Run `rg` to confirm no live V2 references remain for:

```text
DietV2Option
DietV2Unit
referenceQuantity
referenceMacros
scaleMacrosForQuantity
dietPlanV2:recentFoods
CategoryHeaderMacros
ManualFoodDialog
```

- [ ] **Step 4: Run focused and full verification**

Run:

```bash
cd frontend
npm run lint
npm run build
npx playwright test tests/e2e/specs/dietPlans --project=chromium
npx playwright test tests/e2e/specs/dietPlans.spec.ts --project=chromium
npm run test:e2e
```

Expected: lint reports zero warnings/errors, build exits zero, focused tests pass, and all configured browser projects pass.

- [ ] **Step 5: Review the rendered Admin V2 editor**

Open the V2 plan editor at desktop and narrow widths. Verify keyboard quick add, focus states, suggestion loading, category scanning, meal macro entry, free-calorie entry, collapse summaries, dark mode classes, and Hebrew RTL alignment. Fix only concrete issues found in this review.

- [ ] **Step 6: Commit the final route and cleanup slice**

```bash
git add frontend/src frontend/tests/e2e frontend/Agents.md
git commit -m "feat(dietPlanV2): complete quick-add admin editor"
```
