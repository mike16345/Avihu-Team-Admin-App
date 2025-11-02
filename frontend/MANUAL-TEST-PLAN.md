# Adjusted to frontend/: Manual Test Plan

## Preconditions

- App deployed or running locally (same build used in production)
- Admin credentials (see secure channel)
- Known dataset or ability to reset via mock fixtures

## 1. Authentication

### Positive

1. Navigate to `/login`
2. Enter valid admin email + password
3. Submit (`form-submit`)
4. Sidebar should appear with `nav-home-link`
5. No error banner

### Negative

1. Repeat steps but use an invalid password
2. Expect `alert-error` banner and stay on `/login`
3. Ensure submit button is enabled again for retry

## 2. Users list

### Empty dataset

1. Ensure API returns zero users (use mock fixture)
2. Visit `/users`
3. Confirm `empty-state` is visible and no `row-*` elements render

### Populated dataset

1. Seed at least two users (Alpha, Beta)
2. Visit `/users`
3. Verify `table-rows` is visible and `row-user-alpha`, `row-user-beta` exist
4. Hover over a row and open the action menu
5. Ensure `row-<id>-edit` and `row-<id>-delete` actions appear

### Error state

1. Force backend to return 500 for `GET /users`
2. Visit `/users`
3. Confirm `alert-error` banner displays and UI stays responsive (retry possible)

## 3. Create user

### Positive flow

1. From `/users`, click `create-button`
2. Fill all required inputs (`form-field-*`)
3. Submit
4. Expect `toast-success` then navigation to user detail
5. Return to `/users` and confirm new `row-<id>` is present

### Negative flow

1. Force `POST /users` to fail with 500
2. Attempt to create user
3. Observe `alert-error`, submit button re-enabled
4. Return to `/users` and ensure new row is absent

## 4. Edit/Delete (smoke)

1. From action menu, trigger edit (`row-<id>-edit`) to confirm navigation to profile works
2. Cancel changes
3. Trigger delete (`row-<id>-delete`) and cancel in modal to ensure no accidental removal

## 5. Routing + Session persistence

1. Navigate between `/`, `/users`, `/blogs`
2. Use browser back/forward and confirm the correct list state appears (empty vs rows)
3. Refresh the page and ensure session still active (sidebar visible)

## 6. RTL/LTR sanity

1. Toggle layout direction (via system or theme control if available)
2. Repeat a quick smoke on `/users` to ensure selectors remain valid and layout intact

## 7. Logout

1. Click logout button in sidebar
2. Confirm redirect to `/login` and session cleared (no sidebar)
