# Cross-Repository Test Results Reporting Design

## Objective

Give Avihu developers a readable test result at the end of every local or GitHub Actions test
run without allowing application `console.log` output to bury the failures. All three repositories
must produce the same summary and HTML report despite using different test runners. GitHub Actions
must email `michaelgani815@gmail.com` only when one or more tests fail.

The repositories in scope are:

- `Avihu-Team-Admin-App` — Playwright unit and end-to-end tests.
- `Avihu-Team-Client-App` — Vitest unit tests.
- `Avihu-Team-Server` — Jest tests.

## User Experience

Each repository exposes an `npm run test:report` command from its existing application directory.
The command runs every test suite configured for that repository, captures noisy process output,
and prints a compact terminal summary after all suites finish.

The terminal and GitHub Actions summaries show:

- an overall passed or failed state;
- passed, failed, skipped, and total test counts;
- duration by suite and overall;
- failed suite names and failed test names first;
- concise failure messages and useful source locations;
- the repository, branch, commit, actor, workflow, and run link when running in GitHub Actions;
- the location of the complete HTML report and raw logs.

Successful GitHub Actions runs remain quiet except for the concise job summary. Failed runs send
one HTML email after all configured suites complete. The email subject identifies the repository,
branch, and failed-test count. The report and raw logs are also uploaded as workflow artifacts.

## Architecture

### Shared Tool

Each repository contains an identical dependency-free Node.js tool under:

```text
tools/test-report/
  cli.mjs
  adapters/
    jest.mjs
    playwright.mjs
    vitest.mjs
  render-html.mjs
  render-markdown.mjs
  render-email.mjs
```

The files are vendor-copied rather than imported from another repository. This keeps every
repository independently runnable and avoids creating or publishing a fourth package. The tool's
public contract is its configuration file and normalized result model, allowing the same directory
to be copied without source edits.

### Repository Configuration

Each repository adds `test-report.config.mjs` at its root. It exports:

- repository display name;
- report output directory;
- one or more suite definitions;
- each suite's name, framework, working directory, command, and arguments.

The configured suites are:

- Admin: Playwright unit followed by Playwright end-to-end.
- Client: Vitest unit.
- Server: Jest with `--runInBand`.

The CLI accepts an optional suite filter so developers can generate a report for one suite while
CI uses the complete configuration.

### Execution and Capture

For every suite, the CLI:

1. Creates an isolated report subdirectory.
2. Runs the configured test command with the framework's machine-readable JSON reporter enabled.
3. Captures stdout and stderr into the suite's raw log instead of streaming application logs into
   the main terminal output.
4. Parses the framework output through its adapter.
5. Converts the result into one normalized model.
6. Continues to later suites even if an earlier suite failed.

If a runner exits before producing valid JSON, the suite is represented as an infrastructure
failure. The report includes the exit code and a bounded tail of the raw log. The CLI never turns a
runner crash into a passing result.

After all suites finish, the CLI writes:

```text
.test-report/
  report.html
  summary.md
  email.eml
  result.json
  suites/<suite-name>/raw.log
  suites/<suite-name>/runner-results.json
```

The CLI exits with a non-zero status if any suite failed, crashed, timed out, or could not be
parsed. It exits successfully only when every configured suite passed.

### Normalized Result Model

All adapters return the same logical shape:

- run metadata;
- overall status and duration;
- suite results;
- test results with status, title path, duration, failure message, stack, and source location;
- aggregate passed, failed, skipped, and total counts;
- infrastructure errors;
- raw-log paths.

Renderer code depends only on this normalized model, not on Jest, Vitest, or Playwright objects.

## Report Presentation

The HTML report uses inline CSS so it renders correctly in Gmail without external assets or
JavaScript. It includes:

- a prominent green or red status banner;
- four count cards for passed, failed, skipped, and total;
- suite-level status rows with duration;
- failed tests before passed tests;
- readable failure blocks with escaped messages, stack traces, and source locations;
- repository and GitHub run metadata with links;
- a secondary raw-console section after the actionable test results.

Because email clients do not consistently support interactive disclosure widgets, the email shows
a bounded raw-log excerpt. The artifact's `report.html` contains the fuller captured output.
Console output is never discarded.

The Markdown renderer writes the same high-level result to `summary.md`. GitHub Actions appends
that file to `GITHUB_STEP_SUMMARY`, making failures readable directly from the workflow page.

## GitHub Actions Integration

Existing workflow triggers stay unchanged. Each test workflow replaces direct test commands with
`npm run test:report` and gives that step `continue-on-error: true` so reporting can finish.

Subsequent steps use `if: always()` where appropriate:

1. Append `.test-report/summary.md` to `GITHUB_STEP_SUMMARY` when present.
2. Upload `.test-report/` as an artifact.
3. If the test-report step failed, send `.test-report/email.eml` with `curl` over Gmail SMTPS.
4. If the test-report step failed, exit non-zero after the email attempt so the job remains failed.

Email delivery failure is reported in the GitHub summary and does not hide the original test
failure. The workflow remains failed whether tests fail, email delivery fails, or both fail.

The SMTP step uses:

- server: `smtps://smtp.gmail.com:465`;
- username: `${{ secrets.TEST_REPORT_SMTP_USER }}`;
- app password: `${{ secrets.TEST_REPORT_SMTP_APP_PASSWORD }}`;
- recipient: `michaelgani815@gmail.com`.

No SMTP credential is written to a report, artifact, command argument, or repository file. GitHub
secret masking remains active. For pull requests from forks, where secrets are intentionally
unavailable, the workflow skips email delivery, records that fact in the summary, uploads the
report, and still fails correctly for failed tests.

## Package Scripts and Generated Files

Each application `package.json` adds `test:report`. Existing test scripts remain available and
unchanged for focused debugging and watch mode.

Each repository ignores `.test-report/`. Generated reports and logs are never committed.

## Failure and Exit Semantics

- Test failures produce a report, attempt email delivery in GitHub Actions, and fail the job.
- Runner crashes or malformed reporter output are infrastructure failures with raw-log context.
- One failed suite does not prevent later suites from running and appearing in the combined report.
- Report rendering failures fail the command and preserve any raw logs already captured.
- Missing SMTP secrets skip email with an explicit summary notice; they never expose secret names'
  values or convert a failed test run into success.
- Successful runs do not send email.

## Testing Strategy

The shared tool is tested from hand-written Jest, Vitest, and Playwright fixture result files. The
tests verify:

- correct normalization of passed, failed, and skipped tests;
- failure names, messages, stack locations, and counts;
- HTML escaping for test names, logs, and error messages;
- raw-log truncation without losing the original log artifact;
- infrastructure-failure behavior when JSON is absent or malformed;
- MIME headers and recipient generation;
- command exit status for passing and failing aggregate results.

Each repository also runs one integration check using its real test runner against a tiny controlled
fixture. This verifies that the configured reporter output matches the corresponding adapter. The
workflow YAML is reviewed to confirm that email is failure-only and the final job status remains
failed after report delivery.

## Rollout

Implementation proceeds in this order:

1. Build and test the generic tool in the Admin repository.
2. Integrate Admin Playwright unit and end-to-end suites and its PR workflow.
3. Copy the unchanged tool into Client, add its Vitest configuration, and update Quality Checks.
4. Copy the unchanged tool into Server, add its Jest configuration, and update Server Tests.
5. Run local report verification in every repository.
6. Add the two SMTP secrets to all three repositories, or expose them as organization-level
   secrets restricted to these repositories.
7. Trigger a controlled failing workflow in each repository and verify the email, artifact, summary,
   and failed job status before removing the intentional failure.

## Out of Scope

- Changing or removing application `console.log` statements.
- Sending email for successful runs.
- Adding scheduled test runs or changing existing workflow triggers.
- Hosting reports on a separate service.
- Creating and maintaining a fourth shared package repository.
