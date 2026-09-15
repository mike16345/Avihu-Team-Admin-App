# Admin Diet V2 Prototype Cleanup Design

## Objective

Reduce the Admin V2 diet-plan prototype to an honest, maintainable baseline before making
product or persistence decisions. This pass removes production-inappropriate integrations,
fabricated display data, and code made obsolete by those removals. It does not define the final
V2 plan schema.

## Repository Scope

This cleanup changes only the Admin repository. It does not modify the Server or Client
repositories.

## Behavior Retained

- The V2 editor remains available through its existing preview routing.
- Trainers can continue adding, editing, copying, reordering, duplicating, and removing meals,
  categories, and food options.
- The existing local curated suggestions and quick-add parser remain unchanged until the food
  entry workflow is reviewed separately.
- Real macro and calorie summaries derived from the current in-memory plan remain visible.
- Highlights, supplements, free-calorie behavior, templates, draft persistence, manual macro
  overrides, notes, and plan field shapes remain unchanged pending individual decisions.
- Existing V1 Admin behavior remains unchanged.

## Behavior Removed

### Direct Open Food Facts integration

- Remove browser-side Open Food Facts search and its adapter.
- Remove automatic background lookups that silently replace estimated option names or macros.
- Remove remote loading, remote error, cloud badge, and cloud-result handling from the food
  picker.
- Remove the `cloudSourced` option field and code used only to maintain it.
- Keep the picker functional using the current local suggestions while that feature is reviewed.

### Fabricated plan history

- Remove the generated 52-week diet-plan history data and visualization.
- Do not replace it with another placeholder.
- Retain only truthful charts or summaries calculated from the plan currently being edited.

### Mechanical debris

- Remove imports, types, constants, comments, and branches that become unreachable after the two
  removals above.
- Do not use this pass for broad formatting, unrelated component redesign, or schema renaming.

## Explicitly Deferred Decisions

This cleanup must not decide or alter:

- Manual-only food entry versus local curated suggestions.
- Natural-language quick-add parsing.
- Whether estimated nutritional values are allowed.
- V2 template support or template persistence.
- Draft persistence before Server wiring exists.
- Highlights or supplements data shapes.
- Free-calorie ownership or data shape.
- Category-level macro overrides.
- Meal or category notes.
- Trainer-level V1/V2 selection and mismatch handling.
- The hardcoded preview user routing that will later be replaced by trainer version selection.
- The final MongoDB model or API response shape.

## Data and Error Handling

- Removing the external search means food picking no longer has a remote loading or failure
  state.
- Local search remains synchronous and returns an empty state when no local suggestion matches.
- Option values must never change because of a background network response.
- Existing locally generated and manually edited macro values continue to behave as they do now.

## Verification

The cleanup is complete when:

- The Admin build and existing static checks pass.
- No Admin V2 code calls Open Food Facts or another external food endpoint.
- No `cloudSourced` references remain.
- The food picker still opens, searches local suggestions, and selects an option.
- Editing an estimated/manual option does not trigger a network request.
- No fabricated diet-plan history is displayed.
- Current-plan macro summaries still render from real editor state.
- V1 diet-plan files and behavior are unchanged.
- Git shows no changes in the Server or Client repositories.
