# Add User Page QA Review

## Deep Scan

### Files inspected

- `src/App.tsx`
- `src/routes/AppRoutes.tsx`
- `src/pages/UserFormPage.tsx`
- `src/components/forms/UserForm.tsx`
- `src/components/ui/BackButton.tsx`
- `src/components/ui/DatePicker.tsx`
- `src/components/ui/CustomButton.tsx`
- `src/components/templates/dietTemplates/DietaryTypeSelector.tsx`
- `src/schemas/userSchema.ts`
- `src/hooks/mutations/User/useAddUser.tsx`
- `src/hooks/mutations/User/useUpdateUser.tsx`
- `src/hooks/queries/user/useUserQuery.tsx`
- `src/hooks/api/useUsersApi.ts`
- `src/pages/UserDashboard.tsx`
- `src/components/UserDashboard/WeightProgression/WeightProgression.tsx`
- `src/components/UserDashboard/WeightProgression/WeightProgressionPhotos.tsx`
- `src/hooks/api/useWeighInsApi.ts`
- `src/hooks/queries/weighInPhotos/useUserWeighInPhotosQuery.tsx`
- `tests/e2e/utils/mockApi/registry.ts`
- `tests/e2e/utils/mockApi/scenarios/users.ts`
- `tests/e2e/utils/mockApi/scenarios/auth.ts`

### Route registration

- `/users/add` is routed to `UserFormPage` in `src/routes/AppRoutes.tsx`.
- The page is protected by `RequireAuthentication` through the app shell.
- There is no direct sidebar link to `/users/add`.
- The real UI entry point is:
  - sidebar link to `/users`
  - then the add-user action on the users table

### API endpoints used by the page

Direct add-user page flow:

- `POST /users`
  - create a new user on submit

Conditional edit-mode endpoint in the shared page:

- `GET /users/one`
  - only used when the same shared page is mounted as `/users/edit/:id`

Follow-up endpoints after successful create:

- `GET /users/one`
  - `UserFormPage` navigates to `/users/:id?tab=<weight tab>` when the create response includes `data._id`
- `GET /weighIns/weights/user`
  - weight tab loads immediately on the destination dashboard
- `GET /userImageUrls/user`
  - weight photos also load on the destination dashboard

### Form validation logic

The add page uses `react-hook-form` with `zodResolver(userSchema)`.

Validation rules in `src/schemas/userSchema.ts`:

- `firstName`
  - required, minimum length 2
- `lastName`
  - required, minimum length 2
- `phone`
  - required, must match the shared phone regex
- `email`
  - required, must be a valid email
- `dateFinished`
  - required, must be a date
- `planType`
  - required, minimum length 1
- `remindIn`
  - coerced to number
- `dietaryType`
  - optional string array

### State management

- Form state is local to `react-hook-form` inside `UserForm`.
- Server mutation state is owned by TanStack Query through `useAddUser`.
- On success:
  - a success toast is shown
  - the users query is invalidated
- No dedicated Zustand state is used by the add form itself.

### Conditional rendering branches

- Auth guard redirects unauthenticated users to `/login`
- `useUserQuery(id)` is disabled on `/users/add`, so the add route has no initial data loader
- Shared page enters loading mode only in edit mode (`/users/edit/:id`)
- Submit button disables while `useAddUser` is pending
- Successful submit navigates away if the create response includes `data._id`
- If the create response does not include an id, navigation falls back to `/users/?tab=<weight tab>`

### Navigation flows discovered

- Direct authenticated navigation to `/users/add`
- UI navigation:
  - `/users`
  - click add-user action
  - arrive at `/users/add`
- Back button:
  - if browser history exists, it uses `navigate(-1)`
  - otherwise it falls back to `/users`
- Success submit:
  - intended destination is `/users/:id?tab=<weight tab>`
  - this triggers downstream dashboard reads

### Key QA findings

- The user-provided entry point is slightly off: the sidebar links to `/users`, not `/users/add`.
- `UserFormPage` expects `response?.data?._id` after `useAddUser.mutateAsync(...)`, but `useUsersApi.addUser` is typed as returning `IUser`, not `ApiResponse<IUser>`. The runtime clearly expects an `ApiResponse` shape.
- A successful create can trigger multiple follow-up GET routes because the app navigates into the user dashboard immediately.
- For deterministic tests, the add-user happy path must account for those follow-up reads, not just the `POST /users`.

## Test Matrix

Legend:

- `Auto`: covered by the Playwright spec added for this page
- `Manual`: documented but not automated in the spec

### A) Routing and Entry

| Case | Setup | Mock scenario | User action | Expected assertions | Coverage |
| --- | --- | --- | --- | --- | --- |
| Unauthenticated direct navigation | Fresh context, no token | none | Open `/users/add` | Redirect to `/login`, login page visible | Auto |
| Authenticated direct navigation | Logged in first | `auth.session.valid` | Open `/users/add` | Add-user form visible | Auto |
| Navigation via UI | Logged in first | `users.success` | Open `/users`, click add-user action | URL becomes `/users/add`, form visible | Auto |
| Missing params | Authenticated | `auth.session.valid` | Open `/users/add` | Page still renders because add route has no params | Auto |
| Invalid params | Authenticated | `auth.session.valid` | Open `/users/add?foo=bar` | Query params are ignored, form still renders | Manual |
| Back/forward behavior | Logged in on users list | `users.success` | Open add form via UI, browser back, browser forward | URL and visible page follow history state | Auto |

### B) Data States (per endpoint)

| Endpoint | Case | Setup | Mock scenario | User action | Expected assertions | Coverage |
| --- | --- | --- | --- | --- | --- | --- |
| `POST /users` | Success (normal data) | Valid form filled | `users.create.success`, plus downstream dashboard mocks | Submit form | Request sent once, route changes to `/users/:id`, destination renders without unhandled requests | Auto |
| `POST /users` | Success (empty response) | Valid form filled | `users.create.empty`, `users.success` | Submit form | Current behavior: fallback navigation to `/users?tab=...` because no id is present | Auto |
| `POST /users` | Partial/malformed response | Valid form filled | malformed POST body without `data._id` | Submit form | Treat as fallback navigation or stay in place depending on body shape | Manual |
| `POST /users` | 400 | Valid form filled | `users.create.error-400` | Submit form | Stay on `/users/add`, error toast/message path triggered, submit re-enables | Auto |
| `POST /users` | 401 | Valid form filled | `users.create.error-401` | Submit form | Stay on page, submit re-enables | Manual |
| `POST /users` | 403 | Valid form filled | `users.create.error-403` | Submit form | Stay on page, submit re-enables | Manual |
| `POST /users` | 404 | Valid form filled | `users.create.error-404` | Submit form | Stay on page, submit re-enables | Manual |
| `POST /users` | 500 | Valid form filled | `users.create.error-500` | Submit form | Stay on `/users/add`, submit re-enables | Auto |
| `POST /users` | Network failure | Valid form filled | `users.create.network-failure` | Submit form | Stay on page, submit re-enables | Auto |
| `POST /users` | Slow response | Valid form filled | delayed `users.create.success` | Submit form | Submit becomes disabled and loader is visible in the button | Auto |
| `GET /users/one` | Success after create | Create returned id | `users.one.success` | Submit valid form | Dashboard route resolves | Auto |
| `GET /weighIns/weights/user` | Empty response after create | Create returned id | `weigh-ins.user.empty` | Submit valid form | Weight tab renders empty state without crash | Auto |
| `GET /userImageUrls/user` | Empty response after create | Create returned id | `users.delete.precheck.empty` | Submit valid form | Photos area renders empty state without crash | Auto |

### C) User Interactions

| Case | Setup | Mock scenario | User action | Expected assertions | Coverage |
| --- | --- | --- | --- | --- | --- |
| Happy path submit | Valid form filled | `users.create.success` + dashboard follow-up mocks | Click submit | POST is sent, route changes to user dashboard | Auto |
| Validation errors on empty submit | Empty form | none | Click submit | Required field messages are visible, no POST request is sent | Auto |
| Validation errors on invalid format | Invalid email/phone | none | Click submit | Field errors are visible, no POST request is sent | Auto |
| Disabled state while pending | Valid form filled | delayed `users.create.success` | Click submit | Submit is disabled while request is in flight | Auto |
| Double-click prevention | Valid form filled | delayed `users.create.success` | Double-click submit quickly | Only one POST request is sent | Auto |
| Rapid repeated submit | Valid form filled | delayed `users.create.success` | Click submit repeatedly while disabled | No duplicate create requests | Auto |
| Server failure after submit | Valid form filled | `users.create.error-500` | Click submit | No navigation, button re-enables | Auto |
| UI rollback | Not applicable | none | n/a | No optimistic update exists on this page | Documented |

### D) Edge Cases

| Case | Setup | Mock scenario | User action | Expected assertions | Coverage |
| --- | --- | --- | --- | --- | --- |
| Very long strings | Form open | `users.create.error-400` or success | Fill long values, submit | Inputs accept values, request still submits if schema passes | Manual |
| Special characters | Form open | any POST scenario | Fill names with punctuation | Request payload keeps exact values | Manual |
| RTL content | Form open | any | Open page and interact | Labels and controls remain usable in RTL layout | Auto |
| Boundary numeric values | Form open | any | Choose smallest/largest reminder preset | Select works, payload uses numeric seconds | Manual |
| Time/date boundaries | Form open | any | Choose a future preset date | Date is accepted and submitted | Auto |
| Zero/undefined/null fields | Form open | `users.create.empty` | Submit with optional dietary types omitted | Submit still works when required fields are valid | Auto |
| Keyboard navigation | Form open | any | Tab through fields, submit with keyboard | Focus order is usable and submit can be triggered | Manual |
| Focus handling | Date picker open | any | Open date picker, interact with select | Focus remains on interactive controls | Manual |

### E) Permissions / Roles

| Case | Setup | Mock scenario | User action | Expected assertions | Coverage |
| --- | --- | --- | --- | --- | --- |
| No permission to access app | No session | none | Open `/users/add` | Redirect to login | Auto |
| Partial permission | Backend rejects create | `users.create.error-403` | Submit valid form | Failure is handled without navigation | Manual |
| Full permission | Authenticated admin | `users.create.success` | Open and submit form | Full add-user flow works | Auto |

## Planned Automated Coverage

The Playwright spec for this page focuses on:

- auth guard and direct route rendering
- UI entry through the users page add action
- browser history behavior
- client-side validation
- successful create with downstream route mocking
- fallback behavior when create succeeds without an id
- 400, 500, and network-failure submit handling
- pending/disabled state and duplicate-submit prevention
