# Sidebar QA Review

## Review Summary

For the sidebar, the highest-value assertion is not just "the button was clicked". It is:

1. The selected nav link changes the route.
2. The destination screen reaches a stable ready state (loading completes and the page shell/table is visible).

That proves the sidebar is actually usable, not just wired to `navigate()`.

## Files Inspected

- `src/App.tsx`
- `src/routes/AppRoutes.tsx`
- `src/components/Sidebar/AppSidebar.tsx`
- `src/components/ui/sidebar.tsx`
- `src/components/Navbar/LogoutButton.tsx`
- `src/components/theme/mode-toggle.tsx`
- `src/components/theme/theme-provider.tsx`
- `src/hooks/Authentication/useAuth.tsx`
- `src/hooks/Authentication/RequireAuthentication.tsx`
- `src/pages/AdminDashboard.tsx`
- `src/components/AdminDashboard/*` (via existing dashboard behavior and analytics mocks)
- `src/components/tables/UsersTable.tsx` (existing tested route contract)
- `src/pages/BlogPage.tsx`
- `src/components/Blog/BlogList.tsx`
- `src/pages/DietPlanTemplatePage.tsx`
- `src/pages/WorkoutsTemplatePage.tsx`
- `src/components/templates/TemplateTabs.tsx`
- `src/features/leads/LeadsTablePage.tsx`
- `src/pages/FormPresetsPage.tsx`
- `src/components/tables/QuestionnairesTable.tsx`
- `src/components/tables/FormResponsesTable.tsx`
- `src/components/agreements/SignedAgreementsTable.tsx`
- Relevant query hooks in `src/hooks/queries/*`
- Relevant API wrappers in `src/hooks/api/*`
- Existing Playwright infra under `tests/e2e/utils/mockApi/*`

## Endpoints Used During Sidebar Navigation

- `POST /users/user/login`
- `POST /users/user/session` on full reload after authentication
- `GET /analytics/checkIns`
- `GET /analytics/users`
- `GET /analytics/users/expiring`
- `GET /users`
- `GET /blogs/paginate`
- `GET /lessonGroups`
- `GET /presets/dietPlans`
- `GET /presets/workoutPlans`
- `GET /leads`
- `GET /presets/forms`
- `GET /presets/forms/responses` if form tabs are mounted eagerly
- `GET /agreements/admin/signed` if agreement tab content is mounted eagerly

## UI States Discovered

- Unauthenticated guard: protected routes redirect to `/login`.
- Auth loading gate: `RequireAuthentication` shows `Loader` while auth state resolves.
- Sidebar visible only when `authed === true`.
- Desktop sidebar supports expanded/collapsed states through `data-state`.
- Sidebar trigger toggles state and writes the `sidebar_state` cookie.
- Theme toggle switches `light`/`dark` and persists to `localStorage["vite-ui-theme"]`.
- Logout clears secure storage state, clears `sessionStorage`, invalidates the auth query, hides the sidebar, and sends the user back to `/login`.
- Destination pages vary between immediate shell render and async loading:
  - Dashboard: cards after analytics queries
  - Users: table + loader state
  - Blogs: full-page loader before content
  - Template pages: page shell renders, internal data loads in `TemplateTabs`
  - Leads: page shell + table loader state
  - Forms: page shell + table loader state

## Interaction Flows

- Login -> dashboard -> click sidebar link -> route changes -> destination becomes ready.
- Dashboard -> multiple sidebar hops -> browser back/forward restores prior route and content.
- Dashboard -> sidebar trigger -> collapsed -> sidebar trigger -> expanded.
- Dashboard -> theme toggle -> `dark` -> theme toggle -> `light`.
- Dashboard -> logout -> login page -> protected route revisit redirects back to login.

## Test Matrix

### A) Routing & Entry

| Case | Setup | Mock Scenario | User Action | Expected Assertions |
| --- | --- | --- | --- | --- |
| Navigate to each sidebar destination | Logged-in admin on dashboard | `analytics.dashboard.success` + destination success scenarios | Click each sidebar link | Pathname matches target route and page-ready marker is visible |
| Browser history between sidebar routes | Logged-in admin on dashboard | Same as above | Navigate to Users, then Blogs, then back/forward | Pathname and destination ready markers track browser history correctly |
| Protected route after logout | Logged-in admin | No extra API after logout | Click logout, then open `/` | Redirects to `/login` and login page is visible |

### B) Data States (navigation-relevant)

| Case | Setup | Mock Scenario | User Action | Expected Assertions |
| --- | --- | --- | --- | --- |
| Users delayed response | Logged-in admin on dashboard | `analytics.dashboard.success` + `users.success` with `delayMs` | Click Users link | Loader visible, then users table visible |
| Blogs delayed response | Logged-in admin on dashboard | `analytics.dashboard.success` + `blogs.success` with `delayMs` | Click Blogs link | Loader visible, then blogs page visible |
| Forms delayed response | Logged-in admin on dashboard | `analytics.dashboard.success` + delayed `forms.presets.success` | Click Forms link | Loader visible, then questionnaires table visible |

Notes:

- Existing page-specific specs already cover deeper users-page data-state failures.
- For sidebar scope, the important data-state check is that navigation remains stable while the destination loads.

### C) User Interactions

| Case | Setup | Mock Scenario | User Action | Expected Assertions |
| --- | --- | --- | --- | --- |
| Sidebar trigger toggle | Logged-in admin | Standard sidebar scenarios | Click trigger twice | Sidebar `data-state` changes collapsed -> expanded and cookie updates |
| Theme toggle | Logged-in admin | Standard sidebar scenarios | Click theme toggle twice | `vite-ui-theme` persists `dark` then `light`, and root class updates |
| Logout | Logged-in admin | Standard sidebar scenarios | Click logout | Login page shown, sidebar removed, `sessionStorage` cleared |

### D) Edge Cases

| Case | Setup | Mock Scenario | User Action | Expected Assertions |
| --- | --- | --- | --- | --- |
| Cross-browser route readiness | Same test suite across Chromium/Firefox/WebKit | Mock API only | Run full sidebar spec | No engine-specific selectors or timing hacks required |
| Collapsed sidebar state persistence signal | Logged-in admin | Standard sidebar scenarios | Collapse/expand sidebar | Cookie reflects the latest state deterministically |

### E) Permissions / Roles

| Case | Setup | Mock Scenario | User Action | Expected Assertions |
| --- | --- | --- | --- | --- |
| Unauthenticated user | No auth state | None | Visit protected route | Redirect to `/login` |

## Implemented Coverage

The automated coverage for this review is in:

- `tests/e2e/specs/sidebar.spec.ts`

It covers:

- All current top-level sidebar links
- Back/forward history
- Users/blogs/forms loading states
- Sidebar open/close toggle
- Theme toggle persistence
- Logout + route protection
