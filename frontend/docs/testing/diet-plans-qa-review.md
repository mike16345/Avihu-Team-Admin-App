# Diet Plans QA Review

## Review Summary

The `/dietPlans` page is a template-management screen built around a shared `TemplateTabs` abstraction.

The most important assertion for this page is not just that `/dietPlans` renders. It is:

1. The initial presets query resolves into the correct table state.
2. Tab changes swap the backing endpoint and keep the UI stable.
3. The two primary actions behave correctly:
   - Diet-plan add navigates to the preset editor route.
   - Food-group add opens an in-place sheet.

## Files Inspected

- `src/routes/AppRoutes.tsx`
- `src/routes/PresetRoutes.tsx`
- `src/pages/DietPlanTemplatePage.tsx`
- `src/components/templates/TemplateTabs.tsx`
- `src/components/tables/PresetTable.tsx`
- `src/components/templates/workoutTemplates/TableActions.tsx`
- `src/components/ui/skeletons/TemplateTabsSkeleton.tsx`
- `src/components/templates/PresetSheet.tsx`
- `src/pages/ViewDietPlanPresetPage.tsx`
- `src/hooks/api/useDietPlanPresetsApi.ts`
- `src/hooks/api/useMenuItemApi.ts`
- `src/hooks/queries/dietPlans/useDietPlanPresetQuery.tsx`
- `src/hooks/Authentication/useAuth.tsx`
- `src/hooks/Authentication/RequireAuthentication.tsx`
- `tests/e2e/utils/mockApi/routes.ts`
- `tests/e2e/utils/mockApi/index.ts`
- `tests/e2e/utils/mockApi/registry.ts`

## Endpoints Used

Initial page endpoint:

- `GET /presets/dietPlans`

Tab-driven endpoint:

- `GET /menuItems/foodGroup?foodGroup=<protein|carbs|vegetables|fats>`

Mutation endpoints:

- `DELETE /presets/dietPlans/one?id=<presetId>`
- `DELETE /menuItems/one?id=<menuItemId>`

Related entry/auth endpoints:

- `POST /users/user/login`
- `POST /users/user/session` on full-page direct navigation after login
- `GET /analytics/checkIns`
- `GET /analytics/users`
- `GET /analytics/users/expiring`

## UI States Discovered

- Protected route: unauthenticated users are redirected to `/login`.
- Route shell: page header and `TemplateTabs` render immediately once auth resolves.
- Initial loading: `TemplateTabsSkeleton` renders while the active query is loading.
- Success: `PresetTable` renders the current tab’s data.
- Empty: `PresetTable` shows no data rows and an empty-state row.
- Null payload: because `apiData.data?.data || []` is used, `null` is treated as empty.
- `404` special case: `TemplateTabs` suppresses `ErrorPage` for `404` and renders the empty table instead.
- Non-`404` query errors (`400`, `401`, `403`, `500`, network failure): `ErrorPage` renders.
- Main-tab add action: navigates to `/presets/dietPlans`.
- Food-group add action: opens a `Sheet` dialog with `MenuItemForm`.
- Delete action: fires immediately from the row actions menu; there is no confirmation modal and no visible pending/disabled state in the table.

## State Management / Conditional Branches

- `DietPlanTemplatePage` creates five delete mutations and wires them into `TemplateTabs`.
- `TemplateTabs` owns:
  - `selectedForm`
  - `selectedObjectId`
  - `isSheetOpen`
  - `queryKey`
- `TemplateTabs` dynamically selects the active API function from `queryKey`.
- `404` handling is intentionally different from other errors because of:
  - `retry: createRetryFunction(404, 2)`
  - `if (apiData.isError && apiData?.error?.status !== 404) return <ErrorPage ... />`
- `PresetTable` owns client-side:
  - search filtering
  - pagination
  - items-per-page

## Interaction Flows

- Login -> direct navigation to `/dietPlans` -> auth session recheck -> presets load.
- Login -> dashboard -> sidebar nav -> `/dietPlans` -> presets load.
- `/dietPlans` -> click tab -> query key changes -> matching endpoint loads.
- `/dietPlans` -> main add button -> `/presets/dietPlans`.
- `/dietPlans` -> food-group tab -> add button -> sheet opens -> `Escape` closes it.
- `/dietPlans` -> row actions -> delete -> delete request is sent.

## Test Matrix

### A) Routing & Entry

| Case | Setup | Mock Scenario | User Action | Expected Assertions |
| --- | --- | --- | --- | --- |
| Direct navigation | Logged-in admin | `diet-plans.success`, `diet-plans.food-groups.success` | `goto("/dietPlans")` | Path is `/dietPlans`, page shell visible, presets table visible |
| Sidebar entry | Logged-in admin on dashboard | Same | Click sidebar diet-plans link | Path is `/dietPlans`, page shell visible |
| Guarded route | No auth state | None | `goto("/dietPlans")` | Redirect to `/login` |
| Back/forward | Logged-in admin | Same | Open via sidebar, then browser back/forward | Dashboard then diet-plans restore correctly |
| Invalid params | N/A | N/A | N/A | No route params exist on this page |
| Missing params | N/A | N/A | N/A | No required route params exist on this page |

### B) Data States (Per Endpoint)

Primary endpoint `GET /presets/dietPlans`

| Case | Setup | Mock Scenario | User Action | Expected Assertions |
| --- | --- | --- | --- | --- |
| Success | Logged-in admin | `diet-plans.success` | Open page | 2 preset rows visible |
| Success (large) | Logged-in admin | `diet-plans.large` | Open page | Pagination controls work across multiple pages |
| Empty | Logged-in admin | `diet-plans.empty` | Open page | Table visible, 0 data rows |
| Partial / null | Logged-in admin | `diet-plans.null-data` | Open page | Table visible, 0 data rows |
| 400 | Logged-in admin | `diet-plans.error-400` | Open page | `ErrorPage` visible |
| 401 | Logged-in admin | `diet-plans.error-401` | Open page | `ErrorPage` visible |
| 403 | Logged-in admin | `diet-plans.error-403` | Open page | `ErrorPage` visible |
| 404 | Logged-in admin | `diet-plans.error-404` | Open page | Empty table state, not `ErrorPage` |
| 500 | Logged-in admin | `diet-plans.error-500` | Open page | `ErrorPage` visible |
| Network failure | Logged-in admin | `diet-plans.network-failure` | Open page | `ErrorPage` visible |
| Slow response | Logged-in admin | delayed `diet-plans.success` | Open page | `TemplateTabsSkeleton` visible before table |

Tab endpoint `GET /menuItems/foodGroup`

| Case | Setup | Mock Scenario | User Action | Expected Assertions |
| --- | --- | --- | --- | --- |
| Success | Logged-in admin | `diet-plans.food-groups.success` | Switch to protein tab | Food-group table visible with rows |
| Success (large) | Logged-in admin | `diet-plans.food-groups.large` | Switch to protein tab | Pagination can span multiple pages |
| Empty | Logged-in admin | `diet-plans.food-groups.empty` | Switch to protein tab | Table visible, 0 data rows |
| Partial / null | Logged-in admin | `diet-plans.food-groups.null-data` | Switch to protein tab | Table visible, 0 data rows |
| 400 | Logged-in admin | `diet-plans.food-groups.error-400` | Switch to protein tab | `ErrorPage` visible |
| 401 | Logged-in admin | `diet-plans.food-groups.error-401` | Switch to protein tab | `ErrorPage` visible |
| 403 | Logged-in admin | `diet-plans.food-groups.error-403` | Switch to protein tab | `ErrorPage` visible |
| 404 | Logged-in admin | `diet-plans.food-groups.error-404` | Switch to protein tab | Empty table state, not `ErrorPage` |
| 500 | Logged-in admin | `diet-plans.food-groups.error-500` | Switch to protein tab | `ErrorPage` visible |
| Network failure | Logged-in admin | `diet-plans.food-groups.network-failure` | Switch to protein tab | `ErrorPage` visible |
| Slow response | Logged-in admin | delayed `diet-plans.food-groups.success` | Switch to protein tab | Skeleton visible before table |

### C) User Interactions

| Case | Setup | Mock Scenario | User Action | Expected Assertions |
| --- | --- | --- | --- | --- |
| Search | Logged-in admin | `diet-plans.large` | Type in search | Matching rows remain; non-matching rows disappear |
| Pagination | Logged-in admin | `diet-plans.large` | Click next page | Page 2 rows appear; page 1 rows disappear |
| Main add | Logged-in admin | `diet-plans.success` | Click main add button | Navigate to `/presets/dietPlans` and editor page shell loads |
| Food-group add | Logged-in admin | `diet-plans.food-groups.success` | Switch tab, click add | Sheet dialog opens |
| Sheet close | Logged-in admin | `diet-plans.food-groups.success` | Press `Escape` | Sheet dialog closes |
| Delete preset | Logged-in admin | `diet-plans.delete.success` | Open actions, click delete | `DELETE /presets/dietPlans/one` request sent |
| Delete food-group item | Logged-in admin | `diet-plans.food-groups.delete.success` | Open actions, click delete | `DELETE /menuItems/one` request sent |
| Disabled state | N/A | N/A | N/A | No explicit disabled/pending state is exposed by `PresetTable` actions today |
| Double-click prevention | N/A | N/A | N/A | No prevention exists; repeated clicks would issue repeated actions |
| UI rollback | N/A | N/A | N/A | No optimistic row removal is implemented in this table |

### D) Edge Cases

| Case | Setup | Mock Scenario | User Action | Expected Assertions |
| --- | --- | --- | --- | --- |
| Very long names | Logged-in admin | Large-name fixture (not yet automated) | Open page | Rows should stay usable without breaking action access |
| Special characters | Logged-in admin | Special-name fixture (not yet automated) | Search / open actions | Matching and row actions should still work |
| RTL layout | Logged-in admin | Standard success fixtures | Open page | Tabs, table, and sheet remain usable in RTL |
| Zero / null fields | Logged-in admin | `null-data` fixtures | Open page / switch tab | Page degrades to empty state instead of crashing |
| Keyboard modal handling | Logged-in admin | Food-group success | Open sheet, press `Escape` | Dialog closes |

### E) Permissions / Roles

| Case | Setup | Mock Scenario | User Action | Expected Assertions |
| --- | --- | --- | --- | --- |
| Unauthenticated | No auth state | None | Visit `/dietPlans` | Redirect to `/login` |
| Partial / full permission | N/A | N/A | N/A | No page-level role gating is implemented beyond auth in the inspected code |

## Implemented Coverage

Automated coverage is implemented in:

- `tests/e2e/specs/dietPlans.spec.ts`

The spec covers:

- Auth guard
- Direct and sidebar entry
- Back/forward behavior
- Initial endpoint success, empty, null-data, 404, 400/401/403/500, network failure, slow loading
- Food-group endpoint success, 404, 500
- Search and pagination
- Add navigation
- Food-group sheet open/close
- Delete request dispatch for both endpoint types

## QA Risks Worth Keeping In Mind

- `TemplateTabs` intentionally treats `404` as empty, which is easy to regress.
- `PresetTable` is not defensive against non-array non-null `data` values.
- Delete actions do not expose pending state or prevent repeated clicks.
