# Agents.md

## 1. Project Philosophy

This repository is a Vite + React + TypeScript admin frontend. The codebase is organized around route-level pages, domain-specific components, and a dedicated HTTP access layer rather than embedding request logic directly in UI code.

The dominant design pattern is thin composition at the page layer:

- `src/pages` owns route entry points and composes hooks plus domain components.
- `src/components` holds reusable UI and domain widgets.
- `src/hooks/api`, `src/hooks/queries`, and `src/hooks/mutations` separate transport, read caching, and write side effects.

Data-heavy UI favors cached server state through TanStack Query, with only small amounts of client global state kept in Zustand or context.

## 2. Architecture Rules

- Use `src/pages` for route-level screens and `src/routes` for router declarations. Route files should compose pages/components; they should not become the primary home for feature logic.
- Keep HTTP request construction in `src/API/api.ts` and resource-specific API wrappers in `src/hooks/api`. New networked features should follow that layering.
- Prefer a three-step data flow for server data: resource API wrapper -> query or mutation hook -> page/component consumer.
- Use `src/hooks/queries` for read operations and `src/hooks/mutations` for writes. Query and mutation concerns are intentionally separated into different folders.
- Keep global client state minimal. The existing shared store footprint is small (`src/store/userStore.ts`), and auth/theme state are handled via providers.
- Use `src/features/<domain>` for larger self-contained slices when a domain needs its own page, hooks, and table behavior. Smaller domains can continue using `pages` + `components` + `hooks`.
- Preserve module boundaries already in use.
- `src/components/ui` contains shared primitives and wrappers.
- `src/components/<Domain>` contains business-facing UI.
- `src/schemas` holds Zod schemas.
- `src/interfaces` and `src/types` hold shared contracts.
- This is a frontend-only repository. There are no backend controllers, services, or database layers here; backend interaction happens through the HTTP client layer.

## 3. Coding Conventions

* TypeScript runs in `strict` mode. New code should keep explicit types where the codebase already models them.
* The repo uses Prettier with 2-space indentation, semicolons, double quotes, trailing commas (`es5`), and a 100-column print width.
* Use the `@/` path alias for imports from `src` when the import is not local to the current folder.
* Name custom hooks with a `use` prefix. This applies both to React hooks and to the existing repo convention of hook-shaped API factories such as `useUsersApi`.
* Shared interfaces commonly use `I` prefixes in `src/interfaces` (for example `IUser`, `ISession`). Newer feature-local DTOs may use `type` aliases without the prefix (for example `Lead`, `LeadsListDTO`). Follow the local convention of the area you are editing.
* Keep component files in PascalCase when the file exports a component. Utility files, schema files, and feature-local key files commonly use camelCase.
* Prefer enums/constants for repeated identifiers such as query keys, routes, and shared error messages.
* Use `className` + Tailwind utilities for styling. Shared class composition should go through `cn()` from `src/lib/utils.ts`.
* Do not use inline styles except for rare cases where Tailwind cannot express the behavior cleanly. Any inline style must be justified by the surrounding implementation.
* Comments are sparse. Add comments only when logic is genuinely non-obvious; do not annotate routine React or TypeScript code.
* `@typescript-eslint/no-explicit-any` is disabled, but existing typed interfaces and DTOs show a preference for real types when available. Treat `any` as a last resort, not the default.
* Prefer guard clauses over deeply nested `if` blocks.
* Do not use multi-level nested ternary expressions. This is especially important in JSX. Extract the logic into a named variable, helper function, or switch statement instead.
* Keep control blocks and function declarations visually separated with blank lines where it improves readability.
* Leave a blank line before meaningful `return` statements unless the function is a very small one-liner.
* Keep files modular and easy to scan. Component, hook, and utility files should generally stay under 350-400 lines.
* If a file is growing past 350-400 lines, extract focused helpers, hooks, constants, or child components before adding more logic.
* Repeated helper logic should not be copied across files. Move broadly reusable helpers into a general utility file.
* If helpers are only relevant to one feature or page, create a feature-specific utility file instead, such as `dietPlanUtils.ts`, `userCheckInUtils.ts`, or another clearly named helper module.
* Do not create generic utility files for logic that is only used by one feature unless the feature already has several related helpers.
4. React File Structure

React files should be organized in a predictable order so components are easy to scan and refactor.

Preferred order:

Imports
Interfaces and types
Only define interfaces/types in the component file when they are local to that file.
Prefer dedicated files under src/interfaces, src/types, or a feature-local types file for shared contracts.
File-level constants
File-level helper functions
Component declaration
Export

Inside a React component, use this order:

Global hooks, routing hooks, store hooks, theme/style hooks, and other independent constants
useState hooks
useRef hooks
Derived values and memoized values
Callback handlers
useEffect hooks
Empty-dependency mount effects should come first.
Other effects should follow in dependency/behavior order.
Guard-clause returns for loading, error, or missing state
Main JSX return

Group related hooks together with blank lines. For example:

const navigate = useNavigate();
const queryClient = useQueryClient();

const [isOpen, setIsOpen] = useState(false);
const [search, setSearch] = useState("");
const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

const containerRef = useRef<HTMLDivElement | null>(null);
const inputRef = useRef<HTMLInputElement | null>(null);

React readability rules:

Avoid large JSX blocks with embedded business logic.
Avoid nested ternaries in JSX. Use named helpers, early returns, lookup maps, or switch statements.
Avoid building complex arrays or objects directly inside JSX.
Prefer clear local names such as isLoading, isEmpty, filteredUsers, and handleSubmit.
Prefer guard clauses before the main JSX return for loading, error, permission, or missing-data states.
Keep component render logic focused on presentation. Move repeated transformation logic into helpers, hooks, or feature utilities.
Do not split components only for the sake of splitting. Extract a child component when it has a clear responsibility, repeated usage, or makes the parent materially easier to read.

## 5. State & Data Flow

- Treat TanStack Query as the default source of truth for server state. The app bootstraps a persisted query client in `src/main.tsx`.
- Query cache is intentionally long-lived.
- `gcTime` is set to `Infinity` in `src/QueryClient/queryClient.ts`.
- Feature hooks commonly set `staleTime` using shared constants from `src/constants/constants.ts`.
- Mutation hooks typically invalidate query keys on success instead of manually syncing many consumers.
- Server responses commonly arrive as `ApiResponse<T>` (`{ data, message }`). Resource APIs usually unwrap `response.data` before returning values to UI code. Preserve the existing contract for the feature you are touching.
- Guard parameterized queries with `enabled` when required inputs may be absent (for example route params or auth tokens).
- Use custom retry logic when an HTTP status should not be retried (for example 401 or 404) via shared helpers such as `createRetryFunction`.
- Keep URL-driven state in search params when pagination or filters should survive reloads/navigation. The existing pattern is `useStableSearchParams` plus `useUrlPagination`.
- Use Zustand only for small shared client state that is not naturally server-cached. Do not move server collections into Zustand when TanStack Query already owns them.
- For forms, the existing pattern is `react-hook-form` + `zodResolver` + schema modules in `src/schemas`.

## 6. Testing Standards

- There is no established unit/integration test suite pattern in this repository yet.
- Validate frontend changes with the available local project checks before opening or updating a PR.
- `npm run lint`
- `npm run build`
- `npm run test:e2e`
- The Playwright e2e suite is the current automated UI regression flow for this repository. Run it locally alongside lint and build when your change can affect user-facing behavior.
- CI runs the Playwright command through the e2e job in `.github/workflows/pr-tests.yml`, so proofs of change should include a passing Playwright e2e check in addition to any local screenshots or notes.
- When adding a new test framework or test type, follow the existing folder boundaries and update this document once a repeatable convention exists across multiple files.
- For Playwright mock API scenarios under `tests/e2e/utils/mockApi`, prefer code-defined `ApiResponse` fixtures via shared helpers (`apiRoute`, `apiErrorRoute`) for simple success/error payloads. Use `jsonFixtureRoute` + JSON files only when the payload is large or deeply nested enough that inline TypeScript would hurt readability.
- For Playwright JSON fixtures, keep endpoint variants together in `tests/e2e/mocks/fixtures/<name>.json` and select them with `jsonFixtureRoute({ fixture, variant })` instead of creating one JSON file per test case.
- For repeated Playwright setup actions such as admin login, extract a shared helper under `tests/e2e/utils` and reuse it across specs instead of redefining the same flow in each file.

## 7. API & Backend Conventions

- All HTTP transport goes through the shared axios wrapper in `src/API/api.ts`, which adds the `X-Api-Key` header and routes errors through `handleAxiosError`.
- Use the shared helpers `fetchData`, `sendData`, `updateItem`, `patchItem`, and `deleteItem` instead of creating ad hoc axios calls.
- Resource-specific API wrappers live in `src/hooks/api` and should hide endpoint details from components.
- Endpoint naming is lowercase by resource (`"users"`, `"leads"`), and legacy endpoints commonly use `/one` and `/many` suffixes. Match the backend contract already used by the feature you are extending.
- Pass IDs and filters as query params when the existing API does so (for example `{ id }`, `{ userId }`, or `?id=...`) rather than changing endpoint shapes locally.
- Normalize API results as close to the resource wrapper as possible so UI hooks consume domain data, not transport details.
- Surface user-facing request failures through toasts and shared error messages rather than silent failures.

## 8. UI/UX Conventions

- UI is built primarily with Tailwind utility classes and `src/components/ui` primitives configured through `components.json` (shadcn-style structure).
- Global styling is minimal and centralized in `src/index.css` and `src/App.css`. Prefer local Tailwind classes over adding new global CSS.
- Reuse existing UI wrappers such as `CustomButton`, `DeleteModal`, `Loader`, and table primitives before introducing new one-off controls.
- Route screens and admin tables commonly use early returns for loading/error states (`Loader`, `ErrorPage`) before rendering the main layout.
- The interface is heavily localized for Hebrew and right-to-left presentation.
- Many labels, headings, and toasts are Hebrew strings.
- Components frequently set `dir="rtl"` or `dir="ltr"` explicitly where needed.
- `tailwindcss-rtl` is enabled.
- Match the surrounding language and text direction in any edited screen. Do not introduce English UI copy into a Hebrew admin flow unless the surrounding feature already uses English.
- Use shared date helpers (`DateUtils`, `date-fns`, existing locale usage) instead of inventing inconsistent date formatting in each component.

## 9. Performance & Optimization Patterns

- Prefer cache tuning over repeated refetching. Existing hooks use shared stale-time constants and a persisted query cache.
- Invalidate the smallest practical query scope after writes, but follow the existing key structure of the feature you are editing.
- Memoize expensive derived values when they drive large tables or repeated renders. Existing examples include `useMemo` for column definitions and `useCallback` for table actions.
- Clamp and normalize user-controlled URL params before using them in requests. `useUrlPagination` is the current pattern.
- Avoid redundant network calls by using `enabled` on queries with missing dependencies.
- Avoid redundant network calls by centralizing retry rules.
- Avoid redundant network calls by reusing query keys instead of creating one-off cache entries.

## 10. Anti-Patterns Observed

- Do not introduce direct axios usage in pages or domain components when the request can live in the shared API layer.
- Do not use large global stores for server-owned data. The codebase intentionally relies on TanStack Query for that responsibility.
- Do not bypass Zod validation for form-heavy flows that already use `react-hook-form` schemas.
- Do not duplicate shared UI primitives with slightly different one-off components when an existing `src/components/ui` or shared wrapper component already fits.
- Do not replace localized RTL-aware controls with generic LTR-only versions inside existing Hebrew flows.
- Do not add new global CSS for styling that can be expressed with existing Tailwind utilities and theme variables.
- Do not refactor legacy query-key patterns (`QueryKeys` enum vs feature-local key factories) unless the change is scoped enough to keep the entire touched feature internally consistent.

## 11. Agent Operating Rules

- Treat this file as the canonical operating guide for repository conventions.
- Treat this file as a living document.
- If during future work a repeated implementation pattern appears in 3+ places, the agent must update `Agents.md` and formalize it as a rule.
- Update `Agents.md` when new recurring patterns emerge.
- Append new rules when consistency is detected across multiple files.
- Never remove rules unless they are explicitly deprecated by the codebase owners.
- Add new features by extending the nearest existing domain structure instead of inventing a parallel architecture.
- In practice, new feature work usually means adding or extending shared types/interfaces.
- In practice, new feature work usually means adding or extending a `src/hooks/api` resource wrapper.
- In practice, new feature work usually means adding query/mutation hooks.
- In practice, new feature work usually means composing them from a page or domain component.
- Keep refactors incremental. Prefer moving one layer at a time (API wrapper, then hook, then UI consumer) so behavior stays aligned with existing cache keys and UI flows.
- Full-file rewrites are not acceptable by default. Prefer targeted patches that preserve local conventions, imports, and surrounding behavior. Rewrite an entire file only when the file is very small or the whole abstraction is intentionally being replaced.
- Preserve the style of the file you are editing. This codebase contains both hand-written feature code and generated/shadcn-style UI primitives; edits should blend into the local file, not force a global rewrite.
- When patching a feature that already has an established query-key scheme, error-handling pattern, or localization style, keep the patch consistent with that feature even if another part of the repo uses a newer variant.
- If you introduce a new reusable pattern, apply it consistently within the touched feature and then update `Agents.md` once the pattern is repeated broadly enough to count as repository guidance.
- Claude, Codex, and any other coding agent must read `Agents.md` before changing code. If a separate agent-specific file exists, such as `Claude.md`, it must defer to `Agents.md` rather than replacing it.