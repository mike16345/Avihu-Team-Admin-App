# User Dashboard Workout History RIR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display each recorded set's `rir` value in the User Dashboard's compact exercise history and full set-detail history.

**Architecture:** Extend the existing recorded-set and workout-progression view models with an optional numeric `rir` field, then preserve it through the two existing mapping paths. Render it only in workout-history surfaces, using a stable table placeholder for old records and conditional secondary text in detailed rows.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vite, Playwright.

## Global Constraints

- The API property name is exactly `rir`.
- Treat `rir: 0` as present and valid.
- Older records without RIR must remain usable.
- Do not change PR detection, trends, gains, sorting, grouping, summary cards, charts, progress notes, or workout-plan history.
- Preserve the current RTL layout, spacing, colors, dark-mode classes, and narrow-screen behavior.
- Add no dependencies.

---

## File Structure

- `frontend/src/interfaces/IWorkout.ts` defines the API-facing recorded-set shape.
- `frontend/src/components/UserDashboard/WorkoutProgression/workoutProgressionModel.ts` defines the two UI-facing history shapes.
- `frontend/src/components/UserDashboard/WorkoutProgression/workoutProgressionUtils.ts` maps API data into those UI shapes.
- `frontend/src/components/UserDashboard/WorkoutProgression/ExerciseCard.tsx` renders the compact expandable history table.
- `frontend/src/components/UserDashboard/WorkoutProgression/ExerciseDetailModal.tsx` renders every set in the full history modal.
- `frontend/tests/e2e/utils/mockApi/scenarios/recordedSets.ts` supplies deterministic RIR, zero-RIR, and legacy missing-RIR workout data plus the dependencies required by the dashboard route.
- `frontend/tests/e2e/specs/workoutProgression.spec.ts` verifies the user-visible history behavior end to end.

### Task 1: Preserve and render RIR across workout-history views

**Files:**

- Modify: `frontend/tests/e2e/utils/mockApi/scenarios/recordedSets.ts`
- Create: `frontend/tests/e2e/specs/workoutProgression.spec.ts`
- Modify: `frontend/src/interfaces/IWorkout.ts`
- Modify: `frontend/src/components/UserDashboard/WorkoutProgression/workoutProgressionModel.ts`
- Modify: `frontend/src/components/UserDashboard/WorkoutProgression/workoutProgressionUtils.ts`
- Modify: `frontend/src/components/UserDashboard/WorkoutProgression/ExerciseCard.tsx`
- Modify: `frontend/src/components/UserDashboard/WorkoutProgression/ExerciseDetailModal.tsx`

**Interfaces:**

- Consumes: raw recorded sets shaped as `{ plan, weight, repsDone, setNumber, date, note, rir?: number }`.
- Produces: `FlatExercise.sessions[*].rir?: number` and `ExerciseDetailSession.sets[*].rir?: number`.
- Produces: compact history cells with `data-testid="exercise-history-rir"` and detail values with `data-testid="exercise-detail-rir"`.

- [ ] **Step 1: Add a populated workout-history mock scenario**

Extend `recordedSetsScenarios` with `recorded-sets.user.rir`. Its routes must return:

```ts
"recorded-sets.user.rir": [
  apiRoute({
    method: "GET",
    pathname: "/recordedSets/user",
    data: [
      {
        userId: "user-admin-001",
        muscleGroup: "חזה",
        recordedSets: {
          "לחיצת חזה": [
            { plan: "אימון A", weight: 80, repsDone: 8, setNumber: 1, date: "2026-07-01T10:00:00.000Z", note: "", rir: 2 },
            { plan: "אימון A", weight: 85, repsDone: 6, setNumber: 1, date: "2026-07-15T10:00:00.000Z", note: "", rir: 0 },
            { plan: "אימון A", weight: 87.5, repsDone: 5, setNumber: 1, date: "2026-07-20T10:00:00.000Z", note: "" },
            { plan: "אימון A", weight: 90, repsDone: 4, setNumber: 1, date: "2026-08-01T10:00:00.000Z", note: "", rir: 1 },
            { plan: "אימון A", weight: 85, repsDone: 6, setNumber: 2, date: "2026-08-01T10:00:00.000Z", note: "", rir: 0 },
            { plan: "אימון A", weight: 80, repsDone: 8, setNumber: 3, date: "2026-08-01T10:00:00.000Z", note: "" },
          ],
        },
      },
    ],
    message: "Recorded sets loaded",
  }),
  apiRoute({
    method: "GET",
    pathname: "/muscleGroups",
    data: [{ _id: "muscle-chest", name: "חזה" }],
    message: "Muscle groups loaded",
  }),
  apiRoute({
    method: "GET",
    pathname: "/workoutPlans/user",
    data: {
      userId: "user-admin-001",
      workoutPlans: [
        {
          planName: "אימון A",
          muscleGroups: [
            {
              muscleGroup: "חזה",
              exercises: [{ name: "לחיצת חזה", exerciseId: "exercise-bench" }],
            },
          ],
        },
      ],
      cardio: { type: "simple", plan: { minsPerWeek: 0, timesPerWeek: 0 } },
    },
    message: "Workout plan loaded",
  }),
],
```

- [ ] **Step 2: Write the failing browser test**

Create `workoutProgression.spec.ts`, authenticate with the existing helper, enable `users.one.success` and `recorded-sets.user.rir`, then visit `/users/user-admin-001?tab=progress&sub=strength`. Exercise the compact and full history views:

```ts
import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "../utils/adminSession";
import { installMockApi } from "../utils/mockApi";

test("shows RIR in compact and detailed workout history", async ({ page }) => {
  const mockApi = await installMockApi(page);
  mockApi.useScenario("auth.login.success", "analytics.dashboard.success");
  await loginAsAdmin(page);

  mockApi.useScenario("users.one.success", "recorded-sets.user.rir");
  await page.goto("/users/user-admin-001?tab=progress&sub=strength", {
    waitUntil: "domcontentloaded",
  });

  await page.getByRole("button", { name: "ראה היסטוריה מלאה" }).click();
  await expect(page.getByRole("columnheader", { name: "RIR" })).toBeVisible();
  await expect(page.getByTestId("exercise-history-rir")).toHaveText(["1", "—", "0", "2"]);

  await page.getByRole("button", { name: /לחיצת חזה/ }).first().click();
  await expect(page.getByTestId("exercise-detail-rir")).toHaveText(["RIR 1", "RIR 0"]);
  await expect(page.getByTestId("exercise-detail-rir")).toHaveCount(2);
  mockApi.assertNoUnhandledRequests();
});
```

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```bash
cd frontend && npx playwright test tests/e2e/specs/workoutProgression.spec.ts --project=chromium
```

Expected: FAIL because the compact table has no `RIR` column or `exercise-history-rir` cells. If navigation exposes an unrelated missing mock route, add that exact GET route to `recorded-sets.user.rir` and rerun until the test reaches the expected RIR assertion failure.

- [ ] **Step 4: Extend the API and UI-facing types**

Add `rir?: number` to `IRecordedSet` and `RecordedSet`. Change the UI session shapes to:

```ts
export type FlatExercise = {
  name: string;
  group: string;
  sessions: { date: Date; weight: number; reps: number; rir?: number }[];
};

export type ExerciseDetailSet = {
  setNumber: number;
  weight: number;
  reps: number;
  rir?: number;
  program?: string;
};
```

- [ ] **Step 5: Preserve RIR in both mapping paths**

In `flattenRecordedWorkouts`, extend the session accumulator with `rir?: number`. When a set becomes the representative set for a date, assign its RIR without a truthiness check:

```ts
sessionsByDate[dateKey] = {
  weight,
  reps,
  date,
  rir: set.rir ?? undefined,
};
```

In `groupExerciseDetailSessions`, add the same null-safe mapping:

```ts
rir: set.rir ?? undefined,
```

- [ ] **Step 6: Render the compact history column**

Add a fourth `RIR` column header to `ExerciseCard`. For every row render:

```tsx
<td
  data-testid="exercise-history-rir"
  className={`py-1.5 text-center font-semibold ${historyValueClassName}`}
>
  {session.rir ?? "—"}
</td>
```

Keep the column in the existing table; do not modify the collapsed three-column summary block.

- [ ] **Step 7: Render RIR in detailed set rows**

After the repetition value in `ExerciseDetailModal`, conditionally render the compact label using a null check that preserves zero:

```tsx
{set.rir != null && (
  <span
    data-testid="exercise-detail-rir"
    className="text-slate-600 dark:text-slate-300"
  >
    RIR {set.rir}
  </span>
)}
```

Keep it within the existing `flex items-baseline gap-3` metrics group so the program badge and row height continue to follow the current layout.

- [ ] **Step 8: Run the focused test and verify GREEN**

Run:

```bash
cd frontend && npx playwright test tests/e2e/specs/workoutProgression.spec.ts --project=chromium
```

Expected: PASS, proving positive RIR, `RIR 0`, legacy missing RIR, compact history, and detailed history behavior.

- [ ] **Step 9: Run regression verification**

Run:

```bash
cd frontend && npm run lint
cd frontend && npm run build
cd frontend && npx playwright test --project=chromium
```

Expected: all commands exit 0 with no new errors or warnings. Inspect the strength-progress view at desktop width and at 390px width; the history table must remain within its card and detailed set rows must not overlap the program badge.

- [ ] **Step 10: Commit the implementation**

```bash
git add frontend/src/interfaces/IWorkout.ts \
  frontend/src/components/UserDashboard/WorkoutProgression/workoutProgressionModel.ts \
  frontend/src/components/UserDashboard/WorkoutProgression/workoutProgressionUtils.ts \
  frontend/src/components/UserDashboard/WorkoutProgression/ExerciseCard.tsx \
  frontend/src/components/UserDashboard/WorkoutProgression/ExerciseDetailModal.tsx \
  frontend/tests/e2e/utils/mockApi/scenarios/recordedSets.ts \
  frontend/tests/e2e/specs/workoutProgression.spec.ts
git commit -m "feat: show RIR in workout history"
```
