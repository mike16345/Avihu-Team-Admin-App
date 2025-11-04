# Manual Test Plan

The following scenarios cover each routable page. Assume the test account defined by `E2E_TEST_USER` / `E2E_TEST_PASS` unless noted. Mock API data may be used when preparing fixtures; update expectations accordingly for live runs.

### Login — Route: /login
Prereqs: None (logged out browser state).
Happy Path:
1) Navigate to `/login`.
2) Enter valid credentials in `form-field-email` and `form-field-password`.
3) Submit via `form-submit`; expect loader to clear and redirect to `/` with sidebar visible (`nav-home-link`).
Negative:
- Enter malformed email (e.g., `foo`); `form-error-email` appears and submit blocked.
- Provide valid email but backend 401 → toast/`alert-error` displayed; controls re-enabled.
Routing:
- Direct load `/login` while authenticated should redirect to `/`.
- Browser back after successful login returns to prior page without breaking session.

### Admin Dashboard — Route: /
Prereqs: Authenticated session.
Happy Path:
1) Load `/` and wait for analytics requests to settle (`loading` hidden).
2) Verify shortcuts present: `nav-users-add-link`, `nav-presets-dietPlans-link`, `nav-presets-workoutPlans-link`, `nav-blogs-create-link`.
3) Interact with carousel controls (`carousel-next` / `carousel-prev`) to cycle cards.
Negative:
- Force analytics API 500 → `alert-error` toast while dashboard skeleton remains usable.
Routing:
- Refresh retains data via cached queries.
- Back to login logs user out only if `Logout` clicked.

### Users List — Route: /users
Prereqs: Authenticated session with seeded users.
Happy Path:
1) Load `/users`; loader fades.
2) Table displays `table-rows` with at least one `row-<id>`.
3) Use `search-input` to filter; expect matching subset.
4) Click action button `nav-users-add-link` opens `/users/add`.
Negative:
- Simulate delete failure (500) via modal → `alert-error` toast, modal closes.
- Empty dataset shows `empty-state` row.
Routing:
- Direct navigation `/users?page=1` maintains selection.
- Back/forward maintains search filter state via query params.

### User Dashboard — Route: /users/:id
Prereqs: Authenticated session; user exists with weight/workout data.
Happy Path:
1) Navigate directly; loader resolves and `tab-weight` selected.
2) Switch to `tab-workout` and `tab-measurement`; graphs update.
3) Sidebar shortcut `nav-workout-plans-<id>-link` opens edit plan.
Negative:
- 404 for user should show `alert-error` / fallback page.
- Graph data error (500) triggers toast but tabs remain interactive.
Routing:
- Query param `?tab=מעקב אימון` loads workout tab initially.
- Back returns to previous tab per history.

### Create User — Route: /users/add
Prereqs: Authenticated session.
Happy Path:
1) Open `/users/add`; form fields prefilled empty.
2) Fill required `form-field-*` inputs, select plan/dietary toggles, and submit.
3) Expect `toast-success` and redirect to `/users/<newId>?tab=מעקב שקילה`.
Negative:
- Leave `form-field-email` blank → inline validation message.
- Backend 400 surfaces `form-error-email` from schema; 500 shows `alert-error` toast.
Routing:
- `nav-back-button` returns to `/users/` or referencing user route.
- Refresh preserves unsaved values only if hook retains state (otherwise re-enter data).

### Edit User — Route: /users/edit/:id
Prereqs: Authenticated; user with data.
Happy Path:
1) Navigate from list via `row-<id>-view`.
2) Form populates with existing values; adjust fields and submit.
3) Confirm `toast-success` and redirect to `/users/:id` with updates reflected.
Negative:
- Force conflict/409 → `alert-error` while keeping modal open.
- Network timeout via intercept ensures submit re-enabled.
Routing:
- Direct `/users/edit/:id` loads data (loader shown first).
- Back returns to dashboard while preserving prior filter state.

### Blogs List — Route: /blogs
Prereqs: Authenticated; blog fixtures ready.
Happy Path:
1) Open `/blogs`; confirm filter button `filter-lesson-groups` available.
2) Use `nav-blogs-create-link` to open editor; back returns to list.
3) `pagination-next` fetches additional pages.
Negative:
- Empty dataset surfaces `empty-state` grid card.
- Delete modal failure shows toast, row persists.
Routing:
- Navigate to `/blogs?group=<name>` seeds filters.
- Back/forward maintains selected groups state.

### Create Blog — Route: /blogs/create
Prereqs: Authenticated; optional query state for editing.
Happy Path:
1) Fill fields `form-field-title`, `form-field-planType`, `form-field-group`, optionally toggle `radio-image` to upload via `form-field-image`.
2) Enter content via `form-field-content` (rich text) and submit `form-submit`.
3) Expect `toast-success` and redirect to `/blogs` with new card.
Negative:
- Submit without title → inline validation (editor-level) or backend 400 shows toast.
- Upload failure (500) triggers `alert-error` toast and keeps button enabled.
Routing:
- `nav-back-button` returns to `/blogs`.
- Direct `/blogs/create/:id` loads existing blog (edit mode) with fields populated.

### Blog Groups — Route: /presets/blogs/groups
Prereqs: Authenticated; lesson group data.
Happy Path:
1) Open route from blogs page; back button returns to `/blogs`.
2) Click `tab-lessonGroups-add` to open sheet, create new group (modal not covered here but verify appears).
3) Table rows support delete via row actions.
Negative:
- Deletion failure surfaces toast, row remains.
- Empty dataset shows `empty-state`.
Routing:
- Direct load works; closing sheet returns focus to list.
- Back/forward preserves sheet open state when triggered from history.

### Diet Templates — Route: /dietPlans
Prereqs: Authenticated; preset data.
Happy Path:
1) Load page; default tab `tab-dietPlanPresets` active with table rows.
2) Switch to `tab-proteinItems`, `tab-carbItems`, etc.; verify corresponding `tab-*-add` buttons open sheet.
3) Search `search-input` filters rows.
Negative:
- Delete mutation failure triggers toast while row remains.
- Empty dataset yields `empty-state` row.
Routing:
- Direct `/dietPlans?tab=proteinItems` should activate targeted tab.
- Back navigates through tab history.

### Workout Templates — Route: /workoutPlans
Prereqs: Authenticated; workout preset data.
Happy Path:
1) Verify default `tab-WorkoutPlans` table.
2) Use `tab-muscleGroups`, `tab-exercises`, etc. to cycle forms.
3) `tab-*-add` opens sheet; closing returns to list.
Negative:
- Delete API error surfaces toast and row remains.
- Empty dataset -> `empty-state` row.
Routing:
- Direct link with query param sets initial tab.
- Back/forward retains active tab state.

### Diet Presets List — Route: /presets/dietPlans/
Prereqs: Authenticated; diet preset fixtures.
Happy Path:
1) Load route; expect `search-input` and rows from `PresetTable`.
2) Double-click row to open sheet/detail view.
3) `pagination-next` navigates across pages.
Negative:
- Empty dataset -> `empty-state`.
- Delete failure -> toast error.
Routing:
- Direct `/presets/dietPlans/:id` loads detail view (see next section).
- Back closes sheet returning to list.

### Diet Preset Detail — Route: /presets/dietPlans/:id
Prereqs: Accessing from list.
Happy Path:
1) Follow list row; sheet displays preset details (verify fields).
2) `nav-back-button` returns to `/dietPlans` or presets list as applicable.
Negative:
- 404 -> `alert-error` message.
Routing:
- Direct link loads detail with loader, even if not from list.
- Back returns to referring page.

### Workout Presets List — Route: /presets/workoutPlans/
Prereqs: Authenticated; data available.
Happy Path:
1) Display table; use `row-actions-trigger` for context menu.
2) `row-action-edit` navigates to detail/edit.
3) `row-action-delete` opens confirmation and removes row on success.
Negative:
- Delete failure shows toast; row persists.
- Empty dataset -> `empty-state`.
Routing:
- Direct load valid.
- Back/forward retains pagination state.

### Workout Preset Detail — Route: /presets/workoutPlans/:id
Prereqs: Access from list selection.
Happy Path:
1) Ensure preset details load with `nav-back-button` available.
2) Editing fields saves via associated form (if present) and returns to list with toast.
Negative:
- Missing preset -> `alert-error`.
Routing:
- Direct deep link resolves loader + detail view.
- Back returns to list preserving prior filter state.

### Diet Plan Detail — Route: /diet-plans/:id
Prereqs: Authenticated; user/diet plan exists.
Happy Path:
1) Load route; wrapper fetches plan and renders sections.
2) `nav-back-button` returns to originating user dashboard.
3) Ensure tabs/sections show data.
Negative:
- 404 -> not-found or `alert-error` message.
- API failure shows toast but UI still navigable.
Routing:
- Access via `/users/:id` plan link retains breadcrumb.
- Back takes user to same tab from which they navigated.

### Workout Plan Detail — Route: /workout-plans/:id
Prereqs: Authenticated; plan exists.
Happy Path:
1) Direct navigation renders plan with `nav-back-button`.
2) Interact with plan tabs/forms as applicable.
Negative:
- 404 -> fallback message.
- API error -> toast + controls remain enabled.
Routing:
- Launching from user dashboard returns there via back.
- Refresh reloads data correctly.

