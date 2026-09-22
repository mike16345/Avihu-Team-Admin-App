# Trainer Diet Plan Version Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an administrator select V1 or V2 while creating a trainer and display the stored selection as disabled while editing that trainer.

**Architecture:** Extend the existing trainer DTO and React Hook Form/Zod contract. Reuse the current Select primitive in both dialogs; creation includes the field in the POST payload, while update intentionally omits it and renders the stored value read-only.

**Tech Stack:** React, TypeScript, Vite, React Hook Form, Zod, TanStack Query, Tailwind, shadcn-style Select, Playwright mocked API.

## Global Constraints

- The create selector is required and defaults to V1.
- The edit selector displays the stored value and is disabled.
- The update request must not include `dietPlanVersion` in this phase.
- UI copy is Hebrew and RTL-aware.
- All HTTP requests use the existing trainer API wrapper and mutation hooks.
- Playwright API mocks fail on unhandled requests.
- Follow `frontend/Agents.md` and `frontend/docs/testing/Agents.md`.

---

### Task 1: Trainer version DTO, schema, and create payload

**Files:**
- Modify: `frontend/src/interfaces/trainers.ts`
- Modify: `frontend/src/schemas/trainerSchema.ts`
- Create: `frontend/tests/e2e/utils/mockApi/scenarios/trainers.ts`
- Modify: `frontend/tests/e2e/utils/mockApi/registry.ts`
- Create: `frontend/tests/e2e/specs/trainers/trainerDietPlanVersion.spec.ts`

**Interfaces:**
- Produces: `TRAINER_DIET_PLAN_VERSIONS`, `TrainerDietPlanVersion`, and
  `Trainer.dietPlanVersion`.
- Produces: create schema/payload with `dietPlanVersion`; update payload remains unchanged.

- [ ] **Step 1: Write the failing Playwright create test**

Add mocked trainer-list and create scenarios. Capture the real POST request body through a
page-level route or scenario handler, open `/trainers`, open the creation dialog, select V2, submit
all required values, and assert the submitted JSON contains `dietPlanVersion: 2`.

The production mutation caught is displaying a selector that never reaches the API payload.

- [ ] **Step 2: Verify RED**

Run:

```bash
cd frontend
npx playwright test tests/e2e/specs/trainers/trainerDietPlanVersion.spec.ts --project=chromium
```

Expected: FAIL because the selector/type does not exist.

- [ ] **Step 3: Implement constants, types, and Zod contract**

Add:

```ts
export const TRAINER_DIET_PLAN_VERSIONS = [1, 2] as const;
export type TrainerDietPlanVersion = (typeof TRAINER_DIET_PLAN_VERSIONS)[number];
```

Extend `Trainer` and `CreateTrainerBody`. Add `dietPlanVersion: z.union([z.literal(1), z.literal(2)])`
to the create form schema only. Set its default to `1`. Keep `UpdateTrainerBody` and
`buildUpdateTrainerPayload` free of the field.

- [ ] **Step 4: Verify the test still fails for missing UI**

Run the focused Playwright command again.

Expected: FAIL because no visible control changes the default.

### Task 2: Enabled create selector and disabled edit selector

**Files:**
- Modify: `frontend/src/components/trainers/CreateTrainerDialog.tsx`
- Modify: `frontend/src/components/trainers/EditTrainerDialog.tsx`
- Modify: `frontend/tests/e2e/specs/trainers/trainerDietPlanVersion.spec.ts`

**Interfaces:**
- Consumes: `TrainerDietPlanVersion` and constants from Task 1.
- Produces: create control `data-testid="trainer-diet-plan-version-create"` and edit control
  `data-testid="trainer-diet-plan-version-edit"`.

- [ ] **Step 1: Implement the minimal create control**

Add a required RTL Select labelled `גרסת תפריט תזונה` with options `V1` and `V2`. Convert Select's
string output back to the numeric union:

```ts
onValueChange={(value) => field.onChange(Number(value) as TrainerDietPlanVersion)}
value={String(field.value)}
```

Place it near subscription plan/status so account configuration remains visually grouped.

- [ ] **Step 2: Verify create GREEN**

Run the focused Playwright command.

Expected: the create request assertion passes.

- [ ] **Step 3: Add a failing edit-state test**

Mock `GET /trainers/one` with `dietPlanVersion: 2`, open the edit dialog from the trainer details
page, and assert the control shows V2, has disabled semantics, and no update request contains the
field.

The production mutation caught is accidentally allowing version switches or resetting V2 to V1 in
the edit form.

- [ ] **Step 4: Verify RED**

Run the focused Playwright command.

Expected: FAIL because the edit control is absent.

- [ ] **Step 5: Implement the disabled edit control**

Render the same labelled Select from `trainer.dietPlanVersion ?? 1` with `disabled`. It is display
state, not a registered update form field, which makes accidental submission impossible.

- [ ] **Step 6: Verify GREEN, lint, and build**

Run:

```bash
cd frontend
npx playwright test tests/e2e/specs/trainers/trainerDietPlanVersion.spec.ts --project=chromium
npx eslint src/interfaces/trainers.ts src/schemas/trainerSchema.ts src/components/trainers/CreateTrainerDialog.tsx src/components/trainers/EditTrainerDialog.tsx tests/e2e/specs/trainers/trainerDietPlanVersion.spec.ts tests/e2e/utils/mockApi/scenarios/trainers.ts tests/e2e/utils/mockApi/registry.ts
npm run build
```

Expected: all commands pass.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/interfaces/trainers.ts frontend/src/schemas/trainerSchema.ts frontend/src/components/trainers/CreateTrainerDialog.tsx frontend/src/components/trainers/EditTrainerDialog.tsx frontend/tests/e2e/specs/trainers/trainerDietPlanVersion.spec.ts frontend/tests/e2e/utils/mockApi/scenarios/trainers.ts frontend/tests/e2e/utils/mockApi/registry.ts docs/superpowers/plans/2026-08-11-trainer-diet-plan-version-implementation.md
git commit -m "feat(trainers): select diet plan version on create"
```
