# User Dashboard Workout History RIR Design

## Goal

Show the recorded `rir` value wherever a trainer inspects historical sets on the User Dashboard, while preserving the current compact layout and supporting older records that do not contain RIR.

## Scope

The change is limited to the strength-progress workout history UI:

- The expanded history table inside each exercise card.
- The individual set rows inside the full exercise-detail modal.
- The recorded-set TypeScript models and history-mapping utilities that supply those views.

Summary cards, charts, personal-record calculations, progress notes, and workout-plan history are unchanged. RIR is contextual set data rather than a replacement for the existing weight/repetition progression metrics.

## Data Model and Flow

The recorded-set interfaces will add `rir?: number`. It remains optional because existing stored workouts may predate RIR collection.

The workout-progression model will carry RIR through both history representations:

- A flattened exercise session retains the RIR belonging to the representative set already selected for that date. The existing representative-set rule—highest weight for the exercise on that date—does not change.
- A detailed session set maps the raw `rir` value alongside set number, weight, repetitions, and program.

Presence checks will use null/undefined semantics so `rir: 0` is treated as a recorded value.

## UI Design

### Exercise-card history

The expanded history table gains a compact `RIR` column beside the existing date, weight, and repetition columns. A recorded value is shown as its number. An older record without RIR shows an em dash (`—`) so table alignment remains stable and missing data is not confused with zero.

The existing typography, row highlighting, RTL direction, and responsive width remain unchanged. No RIR value is added to the collapsed summary metrics or sparkline.

### Exercise-detail modal

Each detailed set row shows `RIR N` as a compact secondary value alongside weight and repetitions. The value uses the existing muted secondary text treatment, avoiding a new color system or larger row height. When RIR is absent, this element is omitted rather than showing an extra placeholder in every row.

## Compatibility and Edge Cases

- `rir: 0` renders as `0` in the table and as `RIR 0` in the detail row.
- Missing or null RIR renders as `—` in the table and is omitted in the detail row.
- Existing bodyweight/time exercise behavior remains intact.
- RIR does not affect PR detection, trends, gains, sorting, or grouping.

## Testing and Verification

Focused tests will cover the history mapping behavior for a positive RIR value, zero, and missing data. UI verification will confirm the compact table column and detail-row label render from representative fixtures. The frontend lint and build commands will run after implementation, followed by a visual check at desktop and narrow widths when the local app can be exercised with suitable workout-history data.
