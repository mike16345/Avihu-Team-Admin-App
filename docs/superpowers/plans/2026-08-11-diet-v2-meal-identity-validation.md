# Diet V2 Meal Identity and Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace custom V2 meal IDs with Mongo subdocument `_id`, repair update validation, and prevent untouched meal macros from being saved.

**Architecture:** Mongoose owns persisted meal identity while React Hook Form owns temporary render identity. Create and update validation use separate Joi contracts so update controllers can supply authoritative user identity. The Admin represents untouched numeric inputs as `NaN`, renders them blank, and relies on the existing Zod resolver to block persistence.

**Tech Stack:** TypeScript, Mongoose, Joi, Jest, React 18, React Hook Form, Zod, Playwright.

## Global Constraints

- Persisted meals use `_id`; no persisted custom `id` or `mealId` remains.
- New meals have no `_id` until the Server saves them.
- Create requests require `userId`; update requests do not.
- Controllers remain authoritative for update `userId`.
- All four meal macros are required, numeric, finite, and non-negative; zero is valid.

---

### Task 1: Server meal identity and update validation

**Files:**
- Modify: `/Users/michael/Developer/Avihu/Avihu-Team-Server/server/tests/models/dietPlanV2.test.ts`
- Modify: `/Users/michael/Developer/Avihu/Avihu-Team-Server/server/tests/diet-plan-versioned-save.test.ts`
- Modify: `/Users/michael/Developer/Avihu/Avihu-Team-Server/server/src/interfaces/IDietPlanV2.ts`
- Modify: `/Users/michael/Developer/Avihu/Avihu-Team-Server/server/src/models/dietPlanModel.ts`
- Modify: `/Users/michael/Developer/Avihu/Avihu-Team-Server/server/src/models/dietPlanV2Schemas.ts`
- Modify: `/Users/michael/Developer/Avihu/Avihu-Team-Server/server/src/middleware/dietPlanMiddleware.ts`
- Modify: `/Users/michael/Developer/Avihu/Avihu-Team-Server/server/src/functions/dietPlans/index.ts`
- Modify: `/Users/michael/Developer/Avihu/Avihu-Team-Server/server/src/services/dietV2CatalogService.ts`

**Interfaces:**
- Produces: `DietV2Meal._id?: Types.ObjectId | string`.
- Produces: `validateDietPlanUpdate(event)` using V1 or V2 update schemas with optional `userId`.

- [ ] Write failing Jest tests proving Mongoose generates meal `_id`, preserves a supplied `_id`,
  update validation accepts a missing body `userId`, create validation rejects it, and missing macros
  remain invalid.
- [ ] Run the focused Jest tests and confirm the failures are caused by the old `id` contract and
  create-only validator being reused for updates.
- [ ] Enable Mongoose meal subdocument `_id`, remove `id`, preserve optional `_id` in catalog content
  resolution, add update Joi schemas, and wire update routes to `validateDietPlanUpdate`.
- [ ] Run the focused Jest tests until green.

### Task 2: Admin meal identity and blank required macros

**Files:**
- Modify: `frontend/tests/e2e/specs/dietPlans/dietV2Editor.spec.ts`
- Modify: `frontend/tests/e2e/specs/dietPlans/dietV2ServerIntegration.spec.ts`
- Modify: `frontend/tests/e2e/specs/dietPlans/dietV2RecentFoods.spec.ts`
- Modify: `frontend/tests/e2e/utils/mockApi/scenarios/dietPlans.ts`
- Modify: `frontend/src/interfaces/IDietPlanV2.ts`
- Modify: `frontend/src/schemas/dietPlanV2Schema.ts`
- Modify: `frontend/src/components/DietPlanV2/dietPlanV2Utils.ts`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2Editor.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2TraineeView.tsx`

**Interfaces:**
- Consumes: Server `DietV2Meal._id?: string` responses.
- Produces: new meals with no `_id` and blank macro inputs represented internally as `NaN`.

- [ ] Add failing Playwright coverage proving new inputs are blank, a quick-added item cannot be
  saved until all macros are entered, and existing meal `_id` is included in update payloads.
- [ ] Run focused Playwright tests and confirm they fail under zero defaults and the custom `id`
  contract.
- [ ] Replace `id` with optional `_id`, use RHF field IDs only as unsaved render keys, strip `_id`
  when cloning/applying meals, and initialize empty macros as `NaN`.
- [ ] Update existing V2 fixtures/tests to the `_id` contract and fill required macros before tests
  that save new plans.
- [ ] Run the focused Playwright tests until green.

### Task 3: Regression verification and commits

**Files:**
- Verify all files modified in Tasks 1 and 2.

- [ ] Run Server diet-plan V2 Jest tests and `npx tsc --noEmit`.
- [ ] Run Admin Diet V2 Playwright tests, scoped ESLint, and `npm run build`.
- [ ] Run `git diff --check` and inspect both repository diffs.
- [ ] Commit Server and Admin changes separately with focused messages.
