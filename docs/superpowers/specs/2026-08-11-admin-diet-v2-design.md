# Admin Diet Plan V2 Design

## Objective

Replace the current nutrition-derived V2 prototype with a fast trainer-authored meal-plan
editor. Trainers enter literal food descriptions inside categories and manually provide the
macro totals for each meal. The Admin preserves name snapshots in plans while building a shared,
category-scoped suggestion catalog for each trainer team.

This specification covers the Admin V2 product shape and the API contract it expects. Server and
Client implementation remain separate follow-up work.

## Product Principles

- Food entry must be fast and require no nutritional lookup or serving calculation.
- The trainer's text is authoritative and must be preserved exactly in the plan.
- Food-item macros, serving quantities, and measurement units do not exist in V2.
- Meal macros are explicit trainer inputs rather than values derived from food items.
- Catalog suggestions are conveniences, not verified nutritional records.
- Trainer teams share suggestions without allowing one head trainer's catalog to conflict with
  another head trainer's catalog.
- V1 contracts and behavior remain unchanged.

## Canonical Admin Contracts

```ts
export type DietV2MealCategory =
  | "protein"
  | "carbs"
  | "fat"
  | "vegetables"
  | "addon";

export type DietV2CatalogCategory = DietV2MealCategory | "freeCalories";

export interface DietV2PlanItem {
  name: string;
  catalogItemId?: string;
}

export interface DietV2Category {
  category: DietV2MealCategory;
  items: DietV2PlanItem[];
}

export interface DietV2MealMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DietV2FreeCalories {
  calories: number;
  description: string;
}

export interface DietV2Meal {
  id: string;
  name: string;
  categories: DietV2Category[];
  macros: DietV2MealMacros;
  freeCalories?: DietV2FreeCalories;

  // Provisional pass-through matching the apparent Admin UI shape.
  // Product placement and Client behavior require confirmation from Avihu.
  supplements?: string[];
}

export interface IDietPlanV2 {
  _id?: string;
  version: 2;
  meals: DietV2Meal[];
  highlights: string;
}
```

`catalogItemId` refers to the shared catalog record. It is named explicitly instead of `_id`
because an embedded plan item may receive its own MongoDB `_id`. A plan always retains `name` as
a snapshot and never requires a catalog lookup to render.

New editor items may carry transient intent such as `isNew`, but transient flags are not part of
the persisted `IDietPlanV2` contract. The absence of `catalogItemId` tells the server that the
catalog entry must be resolved or inserted.

## V2 Presets

V2 presets reuse the canonical plan content:

```ts
export interface IDietPlanV2Preset extends IDietPlanV2 {
  name: string;
  goal?: "cutting" | "maintain" | "bulking";
  targetGender?: "women" | "men" | "both";
  dietTags?: DietV2DietTag[];
  builtByTrainerId?: string;
}
```

When a V2 trainer opens `/dietPlans`, the page shows only that trainer team's saved V2 presets.
It does not show the legacy V1 protein, carbohydrate, vegetable, or fat menu-item management
tabs.

Saving a V2 preset follows the same catalog-resolution rules as saving a trainee plan.

## Meal Editor

Each meal contains:

- an editable meal name;
- required calories, protein, carbohydrate, and fat fields;
- protein, carbohydrate, fat, vegetable, and add-on categories;
- a flat list of literal names within every category;
- an optional free-calorie block; and
- a provisional optional array of free-flow supplement strings.

Food rows do not contain quantities, measurement units, serving amounts, or macros. The editor
does not parse a trainer's text. For example, `100g Chicken breast`, `100 grams Chicken breast`,
and `200 grams Chicken breast` are preserved as three distinct names.

Items within a category render as simple text separated by `/`. Existing meal operations remain:
create, delete, duplicate, collapse, reorder, and copy category contents.

## Meal Macros

The trainer manually enters all four normal meal values:

- calories;
- protein;
- carbohydrates; and
- fat.

All four fields are required, numeric, and non-negative. Zero is valid. Plan summaries and charts
sum these explicit meal inputs and do not inspect food descriptions.

## Free Calories

Free calories remain an optional, separate meal value:

```ts
{
  calories: 150,
  description: "Fruit / snack / spoonful of spread"
}
```

The UI stores and displays normal meal calories separately from free calories, such as
`448 calories + 150 free calories`. A dedicated aggregation helper must own any combined daily
display so a later product decision can change the calculation without changing the stored meal
shape.

The free-calorie description uses the same suggestion catalog under the `freeCalories` category.
Only the description is cataloged; the numeric allowance remains specific to the meal.

## Highlights and Supplements

`highlights` remains a plan-level plain string in its own tab. Rich text is not introduced in this
phase because Avihu has not confirmed its intended format.

Supplements are a deliberate provisional pass-through. The current Admin UI appears to treat
them as meal-level free-flow `string[]`, while the supplied Client V2 mock does not visibly render
them. This phase must not add parsing, dose units, structured supplement objects, new validation,
or new Client assumptions. Their final placement and behavior require a later product decision.

## Shared Catalog Contract

```ts
export interface DietV2CatalogItem {
  _id: string;
  trainerId: string;
  category: DietV2CatalogCategory;
  name: string;
  normalizedName: string;
  usageCount: number;
  lastUsedAt: string;
}
```

`trainerId` identifies the owning head-trainer catalog. A sub-trainer reads and writes using the
head trainer's catalog identity, allowing the team to share suggestions. A separate head trainer
has a separate `trainerId`, so Trainer A's names never block Trainer B's names.

The server normalizes names by trimming outer whitespace, collapsing internal whitespace, and
performing case-insensitive comparison. The unique catalog key is:

```ts
{ trainerId, category, normalizedName }
```

Consequences:

- the same normalized name cannot occur twice in one category for one trainer team;
- the same name may exist in different categories;
- the same name may appear in different categories within the same meal;
- the same name may exist independently for different head trainers; and
- names and categories are immutable after creation.

An authorized member of the trainer team may delete a catalog suggestion. The delete control
must confirm the exact name before sending the request. Deleting a catalog record removes it from
future suggestions but never changes existing plans or presets. A trainer may later add the same
name again as a new catalog record.

## Quick Add and Search

Every category and free-calorie description has a focused quick-add input.

- Typing displays matching catalog entries beneath the input.
- Clicking a result adds it immediately with no dialog or secondary fields.
- Pressing Enter adds the trainer's exact text when the desired entry is not selected.
- Existing suggestions carry a `catalogItemId`; newly typed entries do not.
- A normalized duplicate is blocked within the same meal category.
- Duplicate names in other categories are allowed.

Search is server-side and scoped by trainer catalog plus category. Matching is case-insensitive
and works on terms anywhere in the name, so `chicken` can match
`100 grams Chicken breast`. Prefix-only matching is insufficient.

The Admin uses a short debounce of approximately 150-200 milliseconds, retains prior results
while the next request is pending, ignores stale responses, and caches results through TanStack
Query. A search failure does not block exact-text quick add; it only removes remote suggestions
for that attempt.

## Popular Suggestions and Lambda Warm-Up

When the editor opens, it sends one lightweight request for the most-used items grouped by
category. This both provides immediate suggestions and begins warming the Lambda before the
trainer starts typing.

The endpoint returns a small bounded list per category. Empty quick-add inputs show that
category's popular results. Typed searches rank primarily by text relevance and use
`usageCount` and `lastUsedAt` as secondary ordering signals.

Popularity is intentionally approximate. The server does not compare a submitted plan with its
previous version. On every successful dirty plan or preset save, it deduplicates the submitted
catalog entries and performs one bulk operation that:

- upserts missing catalog entries;
- increments each distinct submitted entry's `usageCount` by one; and
- updates `lastUsedAt`.

A save caused only by a macro or highlight change may increment the included foods again. That is
acceptable because the counter supports convenient ordering, not analytics or billing.

## Save Flow

The preferred contract is one server-orchestrated plan or preset save rather than a frontend
sequence of catalog writes followed by plan persistence.

1. The Admin submits the complete V2 plan or preset.
2. Known entries include `catalogItemId`; new entries include only their name and parent category.
3. The server resolves the authenticated trainer team's owning `trainerId`.
4. The server deduplicates submitted catalog candidates by category and normalized name.
5. One bulk operation reuses existing entries, inserts missing entries, and updates approximate
   popularity.
6. Concurrent insertion of the same trainer/category/name key is treated as reuse rather than a
   user-facing failure.
7. The server saves the plan or preset with name snapshots and resolved catalog references.
8. The response returns the persisted plan or preset.

New names enter the shared catalog only when Save succeeds. Unsaved text and abandoned editor
sessions do not populate the catalog.

## React Hook Form State

The V2 editor uses React Hook Form as the source of truth for editable plan state.

- Save is disabled when `isDirty` is false.
- Any real editor change enables Save.
- A successful save calls `reset(savedPlan)`, establishing a new clean baseline.
- A failed save preserves the current values and dirty state.
- Unsaved-navigation protection uses the same dirty state.

This feature establishes the pattern locally. Converting unrelated application forms to the same
save discipline is useful but outside this implementation scope.

## Error Handling

- Required macro validation appears on the affected meal and prevents save.
- Same-category duplicate feedback appears at the quick-add input and does not clear the text.
- Search failures keep exact-text entry available and may be retried by typing again.
- Catalog deletion failures retain the suggestion and show the existing generic error toast.
- Save failures retain all editor values and leave Save enabled for retry.
- A concurrent catalog duplicate is resolved by the server and does not surface as an error.

## Removed V2 Concepts

The following concepts are removed from the V2 Admin contract and UI:

- `DietV2Option` as a nutrition-bearing entity;
- item quantity and measurement unit;
- item-level calories, protein, carbohydrates, and fat;
- category-level macro overrides;
- macro scaling when quantity changes;
- automatic food parsing;
- automatic nutritional estimation; and
- plan summaries derived from individual foods.

## Deferred Decisions

The following decisions are explicitly outside this implementation and require later product
confirmation:

- whether highlights should remain plain text or become rich text;
- whether supplements belong to meals, the whole plan, or the Client V2 experience at all;
- the final persisted supplement shape;
- whether free-calorie descriptions should continue participating in the suggestion catalog;
- whether free calories should eventually contribute directly to the normal calorie total; and
- an application-wide local form-draft recovery system.

The future draft-recovery work should use form- and record-specific storage keys, expiration,
restore/discard prompts, successful-save cleanup, and trainer-safe scoping. It is not part of the
current Admin implementation.

## Verification

The Admin work is complete when:

- V2 interfaces no longer contain item quantities, units, or item-level macros;
- every meal requires manual calories, protein, carbohydrate, and fat inputs;
- categories show flat literal-name lists and retain existing meal-management actions;
- category and free-calorie quick add support exact-text entry and debounced suggestions;
- names are checked for duplicates only within the same trainer catalog category;
- `/dietPlans` shows only V2 presets for V2 trainers;
- popular suggestions load once on editor entry and typed searches remain responsive;
- Save follows React Hook Form dirty state and resets the clean baseline after success;
- failed search, delete, validation, and save states preserve trainer input;
- V2 plan and preset saves provide the server-ready catalog candidates described above;
- highlights remain plan-level plain text;
- supplements remain optional and provisional without new parsing or Client assumptions;
- existing V1 files and behavior remain unchanged; and
- lint, build, and the relevant Playwright flows pass.
