# Mock API Fixtures

Use `apiRoute` and `apiErrorRoute` for simple success and error payloads. Use `jsonFixtureRoute` only when the payload is large enough that inline TypeScript becomes noisy.

JSON fixtures now live in `tests/e2e/mocks/fixtures` and are organized as one file per endpoint or shared response shape. Each file contains named variants:

```ts
jsonFixtureRoute({
  method: "GET",
  pathname: "/users",
  fixture: "users.collection",
  variant: "success",
});
```

When a variant only differs by a few fields, prefer `patch` over adding another near-duplicate variant:

```ts
jsonFixtureRoute({
  method: "PUT",
  pathname: "/users/one/field",
  fixture: "users.one",
  variant: "success",
  patch: {
    data: { hasAccess: false },
    message: "User access updated",
  },
});
```

Current fixture inventory:

- `GET /analytics/checkIns` -> `analytics.checkIns` (`success`, `populated`)
- `GET /analytics/users` -> `analytics.users` (`success`, `populated`)
- `GET /analytics/users/expiring` -> `analytics.users-expiring` (`success`, `populated`)
- `POST /users/auth/login` -> `auth.login` (`success`, `error_unauthorized`)
- `POST /users/auth/refresh` -> `auth.login` (`refresh_success`)
- `GET /presets/dietPlans` -> `presets.dietPlans` (`success`, `large`, `empty`, `null_data`)
- `GET /menuItems` -> `menuItems.collection` (`success`)
- `GET /menuItems/foodGroup` -> `menuItems.foodGroup` (`success`, `large`, `empty`, `null_data`)
- `GET /users` -> `users.collection` (`success`, `large`, `empty`, `malformed`, `after_delete`)
- `GET /users/one` -> `users.one` (`success`)

If you add a new endpoint fixture, keep the file name stable, add variants inside that file instead of creating another JSON file, and delete obsolete fixture files after the scenarios are migrated.
