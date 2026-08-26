# Diet Plan V2 Category Macros Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make non-empty protein, carbohydrate, fat, and vegetable categories the macro source of truth; derive read-only meal totals; store add-ons separately; and render add-ons/free calories last in the Client.

**Architecture:** Admin owns explicit entry and actionable validation. The Server validates and recomputes meal totals before persistence so clients cannot forge them. The Client trusts the normalized API contract, renders the four macro categories first, then `addOns`, then free calories, and uses derived meal totals for recording.

**Tech Stack:** React, React Hook Form, Zod, Tailwind, TypeScript, Node.js, Joi, Mongoose, Jest, Expo React Native, Vitest.

## Global Constraints

- Category macros contain calories, protein, carbs, and fat.
- Macros are required only when a category has one or more food items.
- Every required value must be explicitly entered; numeric `0` is valid, blank/undefined is invalid.
- Meal macros are read-only sums of non-empty category macros.
- `addOns` is a meal-level array of plan items and never contributes macros.
- Free calories remain separate and never contribute to meal macros.
- Client order is macro categories, add-ons when non-empty, then free calories when present.
- Preserve V1 behavior, tenant scoping, current API routes, user changes outside this feature, and current responsive/RTL conventions.

---

### Task 1: Admin contract, derivation, and validation

**Files:**
- Modify: `frontend/src/interfaces/IDietPlanV2.ts`
- Modify: `frontend/src/schemas/dietPlanV2Schema.ts`
- Modify: `frontend/src/components/DietPlanV2/dietPlanV2Utils.ts`
- Test: `frontend/e2e/diet-plan-v2.spec.ts`

**Interfaces:**
- Produces: four-value `IMacros`, optional category `macros`, meal `addOns`, and `deriveMealMacros(meal)`.
- Produces: Zod errors at `meals.<index>.categories.<index>.macros.<field>` only for non-empty categories.

- [x] Write failing tests proving blank required fields fail, explicit zero passes, empty categories skip validation, add-ons are separate, and meal totals are derived.
- [x] Replace `addon` in `DIET_V2_MEAL_CATEGORIES` with meal-level `addOns` and make category macros optional in the transport/form type.
- [x] Add conditional Zod validation and derived meal-total helpers.
- [x] Run focused Admin E2E/type checks.

### Task 2: Admin responsive editor and error summary

**Files:**
- Modify: `frontend/src/components/DietPlanV2/CategorySection.tsx`
- Modify: `frontend/src/components/DietPlanV2/MealMacroFields.tsx`
- Modify: `frontend/src/components/DietPlanV2/MealCard.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2Editor.tsx`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2TraineeView.tsx`

**Interfaces:**
- Consumes: category-level RHF paths and `deriveMealMacros` from Task 1.
- Produces: compact category macro inputs, a read-only meal summary, meal/category-specific validation messages, and a separate add-ons editor.

- [x] Wire category macro inputs directly to the category object without zero defaults.
- [x] Clear macros whenever a category's food list changes and keep explicit zeros when populated.
- [x] Replace editable meal totals with a responsive read-only summary.
- [x] Add a save-error summary naming each meal/category and missing macro fields.
- [x] Render/edit add-ons after categories and free calories after add-ons.
- [x] Preserve responsive narrow/desktop layouts and update copy/template/save behavior.

### Task 3: Server canonical contract and persistence

**Files:**
- Modify: `server/src/interfaces/IDietPlanV2.ts`
- Modify: `server/src/models/dietPlanModel.ts`
- Modify: `server/src/services/dietPlanService.ts`
- Test: `server/tests/diet-plan-v2-model.test.ts`
- Test: `server/tests/diet-plan-v2-service.test.ts`

**Interfaces:**
- Consumes: requests with category macros and meal `addOns`.
- Produces: persisted and returned plans whose meal macros are server-derived.

- [x] Write failing Joi/service tests for conditional macros, explicit zero, add-ons, and forged meal totals.
- [x] Update Joi and Mongoose schemas for four categories, optional-on-empty macros, and meal add-ons.
- [x] Normalize legacy `addon` categories at the Admin load/save boundary and persist the canonical `addOns` contract.
- [x] Recompute every meal macro total before create/update/preset persistence.
- [x] Run focused Server tests, record unrelated full-suite baseline failures, and list affected Lambda functions.

### Task 4: Client contract, rendering order, and recording

**Files:**
- Modify: `frontend/src/interfaces/IDietPlanV2.ts`
- Modify: `frontend/src/components/DietPlanV2/dietPlanV2Utils.ts`
- Modify: `frontend/src/components/DietPlanV2/DietPlanV2MealCard.tsx`
- Modify: `frontend/src/components/DietPlanV2/dietPlanV2Consumption.ts`
- Test: `frontend/src/components/DietPlanV2/__tests__/dietPlanV2Utils.test.ts`
- Test: `frontend/src/components/DietPlanV2/__tests__/dietPlanV2Consumption.test.ts`

**Interfaces:**
- Consumes: canonical Server V2 response.
- Produces: ordered macro categories/add-ons/free calories and category-accurate recording totals.

- [x] Write failing tests for strict contract validation and category-level consumed macro totals.
- [x] Update Client types and runtime guard.
- [x] Render add-ons after categories and before free calories.
- [x] Use category macros for individual row recording and derived totals for “I ate everything”.
- [x] Run full Client tests, TypeScript, formatting, and iOS export.

### Task 5: End-to-end verification

- [x] Verify Admin validation/derivation cases with focused browser tests and a production build.
- [x] Verify Server rejects malformed payloads and canonicalizes totals.
- [x] Verify Client contract, totals, and recording logic with the full unit suite and iOS export.
- [x] Run Git whitespace/status checks in all three repositories and preserve unrelated user changes.
