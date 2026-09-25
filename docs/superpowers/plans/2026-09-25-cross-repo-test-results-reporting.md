# Cross-Repository Test Results Reporting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one dependency-free test-report tool to all three Avihu repositories so local and GitHub Actions runs produce a quiet readable summary, a polished HTML artifact, and a failure-only Gmail message to `michaelgani815@gmail.com`.

**Architecture:** Build and test a framework-neutral Node.js reporting core in the Admin repository, with small Jest, Vitest, and Playwright adapters that normalize native JSON results. Vendor-copy the unchanged tool into Client and Server; each repository supplies only a configuration file and workflow wiring. GitHub Actions sends the generated MIME email directly through Gmail SMTPS with credentials held in GitHub secrets.

**Tech Stack:** Node.js 20 built-ins, Playwright JSON reporter, Vitest JSON reporter, Jest JSON output, GitHub Actions, `curl` SMTPS, Node `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-25-cross-repo-test-results-reporting-design.md`

## Global Constraints

- Keep `tools/test-report/` byte-identical in Admin, Client, and Server.
- Add no reporting or email npm dependency.
- Preserve workflow triggers and existing focused/watch test scripts.
- Capture complete stdout/stderr under `.test-report/`; never discard console output.
- Print only compact totals and failed-test details by default.
- Send exactly one email only when a suite fails or crashes.
- Use GitHub secrets `TEST_REPORT_SMTP_USER` and `TEST_REPORT_SMTP_APP_PASSWORD`, populated with the same Gmail credentials already used by the Server.
- Never expose the Gmail app password in code, reports, artifacts, arguments, or logs.
- Keep the workflow failed after reporting and email delivery.
- Escape all runner-controlled text in HTML and MIME output.
- Ignore `.test-report/` in every repository.

## Review Focus

- Escape HTML metacharacters and Unicode in titles, assertions, stacks, and logs; Task 2 tests this.
- Convert a missing/malformed runner JSON file into an infrastructure failure with a log tail; Task 4 tests this.
- Continue later suites after an earlier failure and emit one aggregate result; Task 4 tests this.
- Skip SMTP cleanly when forked PRs lack secrets without hiding the test failure; Task 5 tests this.
- Bound long log excerpts and generate valid CRLF UTF-8 MIME; Tasks 2 and 3 test this.

---

### Task 1: Normalize Jest, Vitest, and Playwright results

**Files:**
- Create: `tools/test-report/model.mjs`
- Create: `tools/test-report/adapters/index.mjs`
- Create: `tools/test-report/adapters/jest.mjs`
- Create: `tools/test-report/adapters/vitest.mjs`
- Create: `tools/test-report/adapters/playwright.mjs`
- Create: `tools/test-report/__tests__/fixtures/{jest,vitest,playwright}-results.json`
- Create: `tools/test-report/__tests__/adapters.test.mjs`

**Interfaces:**
- Consumes: native runner JSON plus `{ name, rawLogPath }`.
- Produces: `normalizeResult(framework, nativeResult, context) -> NormalizedSuiteResult`.
- Produces: `aggregateResults(metadata, suites) -> NormalizedRunResult`.
- A normalized test has `status`, `titlePath`, `durationMs`, `failureMessage`, `stack`, and optional `location`.

- [ ] **Step 1: Create literal native result fixtures**

Give every framework one passed, one failed, and one skipped test. Each failure includes a source location plus `Expected <strong>safe</strong> & "quoted"` and `שגיאת בדיקה`.

- [ ] **Step 2: Write failing adapter tests**

```js
test("normalizes all runners to identical count semantics", async () => {
  for (const framework of ["jest", "vitest", "playwright"]) {
    const suite = normalizeResult(framework, await readFixture(framework), {
      name: `${framework} suite`,
      rawLogPath: `suites/${framework}/raw.log`,
    });
    assert.deepEqual(suite.counts, { passed: 1, failed: 1, skipped: 1, total: 3 });
    assert.equal(suite.status, "failed");
  }
});

test("aggregate status fails when any suite fails", () => {
  const result = aggregateResults({ repository: "Avihu" }, [passingSuite, failingSuite]);
  assert.equal(result.status, "failed");
  assert.deepEqual(result.counts, { passed: 2, failed: 1, skipped: 0, total: 3 });
});
```

- [ ] **Step 3: Verify RED**

Run `node --test tools/test-report/__tests__/adapters.test.mjs`.
Expected: FAIL because model and adapter modules do not exist.

- [ ] **Step 4: Implement the normalized model**

```js
export function aggregateResults(metadata, suites) {
  const counts = suites.reduce(
    (sum, suite) => ({
      passed: sum.passed + suite.counts.passed,
      failed: sum.failed + suite.counts.failed,
      skipped: sum.skipped + suite.counts.skipped,
      total: sum.total + suite.counts.total,
    }),
    { passed: 0, failed: 0, skipped: 0, total: 0 }
  );
  return {
    metadata,
    status: suites.every((suite) => suite.status === "passed") ? "passed" : "failed",
    durationMs: suites.reduce((sum, suite) => sum + suite.durationMs, 0),
    counts,
    suites,
  };
}
```

- [ ] **Step 5: Implement Jest and Vitest adapters**

Map `passed` to passed, `failed` to failed, and `pending`, `skipped`, or `todo` to skipped. Build `titlePath` from `ancestorTitles` and `title`; use the first failure message and parse the first `file:line:column` location.

- [ ] **Step 6: Implement the Playwright adapter**

Recursively flatten `suites -> specs -> tests -> results`. Treat an expected skipped test or absent execution as skipped. Prefer the final result error and fall back to the spec location.

- [ ] **Step 7: Verify GREEN and commit**

Run `node --test tools/test-report/__tests__/adapters.test.mjs`; expect PASS.

```bash
git add tools/test-report
git commit -m "feat: normalize test runner results"
```

### Task 2: Render terminal, Markdown, and HTML reports

**Files:**
- Create: `tools/test-report/render-terminal.mjs`
- Create: `tools/test-report/render-markdown.mjs`
- Create: `tools/test-report/render-html.mjs`
- Create: `tools/test-report/__tests__/renderers.test.mjs`

**Interfaces:**
- `renderTerminal(result) -> string`
- `renderMarkdown(result) -> string`
- `renderHtml(result, options?) -> string`
- `escapeHtml(value) -> string`
- `truncateText(value, maxCharacters) -> string`

- [ ] **Step 1: Write failing renderer tests**

```js
test("HTML escapes untrusted content and puts failures first", () => {
  const html = renderHtml(failedRun);
  assert.match(html, /Expected &lt;strong&gt;safe&lt;\/strong&gt; &amp; &quot;quoted&quot;/);
  assert.equal(html.includes("<script>"), false);
  assert.ok(html.indexOf("failed test") < html.indexOf("passed test"));
});

test("terminal output excludes captured console noise", () => {
  const output = renderTerminal(failedRun);
  assert.match(output, /1 failed/);
  assert.equal(output.includes("raw noisy console line"), false);
});

test("raw excerpts are bounded and retain the artifact path", () => {
  const html = renderHtml(longLogRun, { maxRawLogCharacters: 8000 });
  assert.equal(html.length < 20000, true);
  assert.match(html, /suites\/unit\/raw\.log/);
});
```

- [ ] **Step 2: Verify RED**

Run `node --test tools/test-report/__tests__/renderers.test.mjs`.
Expected: FAIL because renderers do not exist.

- [ ] **Step 3: Implement escaping and formatting**

Escape `& < > " '` before interpolation. Format sub-second durations as milliseconds and longer durations to one decimal second.

- [ ] **Step 4: Implement terminal and Markdown renderers**

Terminal failure format:

```text
TESTS FAILED — Avihu Team Server
Passed 228 | Failed 11 | Skipped 0 | Total 239 | 10.6s

FAILED
1. TrainerService library seeding › createTrainer seeds Avihu library
   tests/trainer-service-library-access.test.ts:46
   TypeError: ensureAvihuLibraryToTrainer is not a function

Report: .test-report/report.html
Raw logs: .test-report/suites/
```

Passing output contains only the headline, totals, and paths. Markdown adds suite rows and GitHub run links.

- [ ] **Step 5: Implement responsive email-safe HTML**

Use inline CSS and no scripts/assets. Render a status banner, count cards, suite table, failure cards, passed/skipped summaries, run metadata, and bounded raw-log excerpts.

- [ ] **Step 6: Verify GREEN and commit**

Run `node --test tools/test-report/__tests__/renderers.test.mjs`; expect PASS.

```bash
git add tools/test-report
git commit -m "feat: render readable test reports"
```

### Task 3: Generate the failure email

**Files:**
- Create: `tools/test-report/render-email.mjs`
- Create: `tools/test-report/__tests__/email.test.mjs`

**Interfaces:**
- `renderEmail({ result, html, from, to }) -> string` returns a CRLF MIME message.
- The app password is never an input to report code.

- [ ] **Step 1: Write the failing MIME test**

```js
test("builds a UTF-8 HTML failure email", () => {
  const email = renderEmail({
    result: failedRun,
    html: "<html><body>שגיאה</body></html>",
    from: "Avihu CI <michaelgani815@gmail.com>",
    to: "michaelgani815@gmail.com",
  });
  assert.match(email, /^From: Avihu CI <michaelgani815@gmail\.com>\r\n/);
  assert.match(email, /Content-Type: text\/html; charset=UTF-8\r\n/);
  assert.match(email, /11 failed/);
  assert.equal(email.includes("APP_PASSWORD"), false);
});
```

- [ ] **Step 2: Verify RED**

Run `node --test tools/test-report/__tests__/email.test.mjs`.
Expected: FAIL because `render-email.mjs` does not exist.

- [ ] **Step 3: Implement safe MIME generation**

Reject CR/LF in header inputs. Generate `MIME-Version: 1.0`, HTML UTF-8 content type, base64 body, CRLF line endings, and subject `[TESTS FAILED] <repo> — <branch> — <count> failed`.

- [ ] **Step 4: Verify GREEN and commit**

Run `node --test tools/test-report/__tests__/email.test.mjs`; expect PASS.

```bash
git add tools/test-report
git commit -m "feat: generate failure report emails"
```

### Task 4: Build the generic runner CLI and integrate Admin

**Files:**
- Create: `tools/test-report/cli.mjs`
- Create: `tools/test-report/runner.mjs`
- Create: `tools/test-report/__tests__/runner.test.mjs`
- Create: `test-report.config.mjs`
- Modify: `frontend/package.json`
- Modify: `.gitignore`

**Interfaces:**
- `node tools/test-report/cli.mjs --config <path> [--suite <name>] [--verbose]`
- Config exports `{ repository, outputDir, workflowPath, email, suites }`.
- Suite shape: `{ name, framework, cwd, command, args }`.
- Outputs `result.json`, `report.html`, `summary.md`, `email.eml`, and per-suite raw/native files.
- Exits `0` only if every selected suite passes.

- [ ] **Step 1: Write failing child-process tests**

```js
test("continues after a failed suite", async () => {
  const result = await runConfiguredSuites(failThenPassConfig, tempDir);
  assert.equal(result.suites.length, 2);
  assert.deepEqual(result.suites.map((suite) => suite.status), ["failed", "passed"]);
});

test("missing JSON is an infrastructure failure", async () => {
  const result = await runConfiguredSuites(crashingConfig, tempDir);
  assert.equal(result.status, "failed");
  assert.match(result.suites[0].infrastructureErrors[0], /exited with code 2/);
  assert.match(result.suites[0].rawLogTail, /controlled crash/);
});

test("writes reports while keeping noise in raw.log", async () => {
  const run = await runCli(noisyPassingConfig, tempDir);
  assert.equal(run.stdout.includes("very noisy console line"), false);
  await assertFileIncludes("suites/unit/raw.log", "very noisy console line");
});
```

- [ ] **Step 2: Verify RED**

Run `node --test tools/test-report/__tests__/runner.test.mjs`.
Expected: FAIL because runner/CLI modules do not exist.

- [ ] **Step 3: Implement framework command decoration**

```js
const FRAMEWORK_ARGUMENTS = {
  jest: (path) => ["--json", `--outputFile=${path}`],
  vitest: (path) => ["--reporter=json", `--outputFile=${path}`],
  playwright: () => ["--reporter=json"],
};
```

For Playwright set `PLAYWRIGHT_JSON_OUTPUT_NAME` to the absolute native-result path.

- [ ] **Step 4: Implement child execution and recovery**

Use `spawn` with `shell: false`; pipe both output streams to `raw.log`. Parse JSON after exit. Convert spawn, exit-without-JSON, read, or parse errors into infrastructure failures. Preserve the complete log and embed only a bounded tail.

- [ ] **Step 5: Implement CLI orchestration**

Resolve paths from the config directory, safely recreate `.test-report/`, run every suite sequentially, render all artifacts, print only `renderTerminal`, and set `process.exitCode` from aggregate status. Never read SMTP secrets.

- [ ] **Step 6: Add Admin config and package script**

```js
export default {
  repository: "Avihu Team Admin App",
  outputDir: ".test-report",
  workflowPath: ".github/workflows/pr-tests.yml",
  email: {
    from: "Avihu CI <michaelgani815@gmail.com>",
    to: "michaelgani815@gmail.com",
  },
  suites: [
    { name: "Unit tests", framework: "playwright", cwd: "frontend", command: "npx", args: ["playwright", "test", "--config=playwright.unit.config.ts"] },
    { name: "End-to-end tests", framework: "playwright", cwd: "frontend", command: "npx", args: ["playwright", "test"] },
  ],
};
```

Add `"test:report": "node ../tools/test-report/cli.mjs --config ../test-report.config.mjs"` to `frontend/package.json` and `/.test-report/` to `.gitignore`.

- [ ] **Step 7: Verify generic and Admin integration**

```bash
node --test tools/test-report/__tests__/*.test.mjs
cd frontend && npm run test:report -- --suite "Unit tests"
```

Expected: tests pass and all report files exist. Open `.test-report/report.html` in the Codex browser panel and inspect desktop/mobile readability.

- [ ] **Step 8: Commit**

```bash
git add tools/test-report test-report.config.mjs frontend/package.json frontend/package-lock.json .gitignore
git commit -m "feat: add readable test report runner"
```

### Task 5: Integrate Admin GitHub Actions email and status handling

**Files:**
- Modify: `.github/workflows/pr-tests.yml`
- Create: `tools/test-report/__tests__/workflow-contract.test.mjs`

**Interfaces:**
- Always publishes summary and artifact.
- Emails only when `steps.test_report.outcome == 'failure'` and both secrets exist.
- Restores a failed job status after all reporting steps.

- [ ] **Step 1: Write the failing workflow contract test**

Resolve the repository-specific workflow through the otherwise identical root config so this test remains byte-identical in all three repositories:

```js
const repoRoot = process.cwd();
const { default: config } = await import(
  pathToFileURL(path.join(repoRoot, "test-report.config.mjs"))
);
const workflowPath = path.resolve(repoRoot, config.workflowPath);
```

```js
test("workflow publishes every report and emails only failures", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  assert.match(workflow, /id: test_report/);
  assert.match(workflow, /continue-on-error: true/);
  assert.match(workflow, /GITHUB_STEP_SUMMARY/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /steps\.test_report\.outcome == 'failure'/);
  assert.match(workflow, /smtps:\/\/smtp\.gmail\.com:465/);
  assert.match(workflow, /secrets\.TEST_REPORT_SMTP_USER/);
  assert.match(workflow, /secrets\.TEST_REPORT_SMTP_APP_PASSWORD/);
  assert.match(workflow, /Failure email skipped because SMTP secrets are unavailable/);
  assert.match(workflow, /exit 1/);
  assert.doesNotMatch(workflow, /echo.*TEST_REPORT_SMTP_APP_PASSWORD/);
});
```

- [ ] **Step 2: Verify RED**

Run `node --test tools/test-report/__tests__/workflow-contract.test.mjs`.
Expected: FAIL because Admin still runs Playwright directly.

- [ ] **Step 3: Replace the direct test step**

Keep checkout, Node, npm, and browser setup. Run `npm run test:report` as `id: test_report` with `continue-on-error: true`.

- [ ] **Step 4: Add summary and artifact steps**

Use `if: always()` to append `.test-report/summary.md` and upload `.test-report/` as `test-report-${{ github.run_id }}`. Any `run:` step that reads a root report path must set `working-directory: .` because the job default is `frontend`.

- [ ] **Step 5: Add failure-only SMTP delivery**

Expose secrets only in the email steps. Run on failed tests with available credentials:

```bash
curl --fail-with-body --silent --show-error \
  --url "smtps://smtp.gmail.com:465" --ssl-reqd \
  --mail-from "${TEST_REPORT_SMTP_USER}" \
  --mail-rcpt "michaelgani815@gmail.com" \
  --user "${TEST_REPORT_SMTP_USER}:${TEST_REPORT_SMTP_APP_PASSWORD}" \
  --upload-file ".test-report/email.eml"
```

If secrets are absent, append `Failure email skipped because SMTP secrets are unavailable.` to the summary. Give email delivery `continue-on-error: true`.

- [ ] **Step 6: Restore final failure status**

Add an `if: always() && steps.test_report.outcome == 'failure'` step after reporting that exits `1`.

- [ ] **Step 7: Verify GREEN and commit**

Run all generic tests; expect PASS.

```bash
git add .github/workflows/pr-tests.yml tools/test-report/__tests__/workflow-contract.test.mjs
git commit -m "ci: email readable test failures"
```

### Task 6: Copy and integrate Client Vitest

**Files:**
- Copy unchanged: Admin `tools/test-report/` to Client `tools/test-report/`
- Create: Client `test-report.config.mjs`
- Modify: Client `frontend/package.json`, `.gitignore`, `.github/workflows/quality-checks.yml`

**Interfaces:**
- One Vitest suite named `Unit tests`.
- Same summary/artifact/failure-email/final-status contract as Admin.

- [ ] **Step 1: Copy and prove byte identity**

Run `diff -ru ../Avihu-Team-Admin-App/tools/test-report tools/test-report`; expect no output. If workflow tests need repository paths, parameterize through config instead of forking shared code.

- [ ] **Step 2: Add Client config**

```js
export default {
  repository: "Avihu Team Client App",
  outputDir: ".test-report",
  workflowPath: ".github/workflows/quality-checks.yml",
  email: { from: "Avihu CI <michaelgani815@gmail.com>", to: "michaelgani815@gmail.com" },
  suites: [
    { name: "Unit tests", framework: "vitest", cwd: "frontend", command: "npx", args: ["vitest", "run"] },
  ],
};
```

- [ ] **Step 3: Add package and ignore entries**

Add `"test:report": "node ../tools/test-report/cli.mjs --config ../test-report.config.mjs"` to Client `frontend/package.json` and `/.test-report/` to Client `.gitignore`.

- [ ] **Step 4: Verify Client locally**

Run generic tests and `cd frontend && npm run test:report`; expect compact successful output and complete artifacts.

- [ ] **Step 5: Update Quality Checks**

Replace only the `unit-tests` job's direct command. The replacement must:

1. run `npm run test:report` as `id: test_report` with `continue-on-error: true`;
2. append `.test-report/summary.md` to `GITHUB_STEP_SUMMARY` under `if: always()` and `working-directory: .`;
3. upload `.test-report/` with `actions/upload-artifact@v4` under `if: always()`;
4. on `steps.test_report.outcome == 'failure'`, expose the two GitHub secrets only to the SMTP step and send `.test-report/email.eml` with the exact `curl` invocation below;
5. when either secret is empty, append `Failure email skipped because SMTP secrets are unavailable.`;
6. finish with `if: always() && steps.test_report.outcome == 'failure'` and `exit 1`.

Set `working-directory: .` on every `run:` step that reads `.test-report/`, including the summary, SMTP, missing-secret notice, and final status steps, because this job defaults to `frontend`.

```bash
curl --fail-with-body --silent --show-error \
  --url "smtps://smtp.gmail.com:465" --ssl-reqd \
  --mail-from "${TEST_REPORT_SMTP_USER}" \
  --mail-rcpt "michaelgani815@gmail.com" \
  --user "${TEST_REPORT_SMTP_USER}:${TEST_REPORT_SMTP_APP_PASSWORD}" \
  --upload-file ".test-report/email.eml"
```

Leave `advisory-typecheck` unchanged.

- [ ] **Step 6: Verify and commit Client**

Run generic/workflow contract tests and `npm run test:unit`; expect PASS.

```bash
git add tools/test-report test-report.config.mjs frontend/package.json frontend/package-lock.json .gitignore .github/workflows/quality-checks.yml
git commit -m "ci: add readable emailed test reports"
```

### Task 7: Copy and integrate Server Jest

**Files:**
- Copy unchanged: Admin `tools/test-report/` to Server `tools/test-report/`
- Create: Server `test-report.config.mjs`
- Modify: Server `server/package.json`, `.gitignore`, `.github/workflows/server-tests.yml`

**Interfaces:**
- One Jest suite named `Server tests`, run in-band.
- Same summary/artifact/failure-email/final-status contract as Admin.

- [ ] **Step 1: Copy and prove byte identity**

Run `diff -ru ../Avihu-Team-Admin-App/tools/test-report tools/test-report`; expect no output.

- [ ] **Step 2: Add Server config**

```js
export default {
  repository: "Avihu Team Server",
  outputDir: ".test-report",
  workflowPath: ".github/workflows/server-tests.yml",
  email: { from: "Avihu CI <michaelgani815@gmail.com>", to: "michaelgani815@gmail.com" },
  suites: [
    { name: "Server tests", framework: "jest", cwd: "server", command: "npx", args: ["jest", "--runInBand"] },
  ],
};
```

- [ ] **Step 3: Add package and ignore entries**

Add `"test:report": "node ../tools/test-report/cli.mjs --config ../test-report.config.mjs"` to Server `server/package.json` and `/.test-report/` to Server `.gitignore`.

- [ ] **Step 4: Verify Server locally**

Run generic tests and `cd server && npm run test:report`. On the current branch, expect a readable failed report for existing failures, exit `1`, and noisy logs only under `.test-report/suites/`.

- [ ] **Step 5: Update Server Tests**

Replace the full-suite direct Jest command. The replacement must:

1. run `npm run test:report` as `id: test_report` with `continue-on-error: true`;
2. append `.test-report/summary.md` to `GITHUB_STEP_SUMMARY` under `if: always()` and `working-directory: .`;
3. upload `.test-report/` with `actions/upload-artifact@v4` under `if: always()`;
4. on `steps.test_report.outcome == 'failure'`, expose the two GitHub secrets only to the SMTP step and send `.test-report/email.eml` with the exact `curl` invocation below;
5. when either secret is empty, append `Failure email skipped because SMTP secrets are unavailable.`;
6. finish with `if: always() && steps.test_report.outcome == 'failure'` and `exit 1`.

Set `working-directory: .` on every `run:` step that reads `.test-report/`, including the summary, SMTP, missing-secret notice, and final status steps, because this job defaults to `server`.

```bash
curl --fail-with-body --silent --show-error \
  --url "smtps://smtp.gmail.com:465" --ssl-reqd \
  --mail-from "${TEST_REPORT_SMTP_USER}" \
  --mail-rcpt "michaelgani815@gmail.com" \
  --user "${TEST_REPORT_SMTP_USER}:${TEST_REPORT_SMTP_APP_PASSWORD}" \
  --upload-file ".test-report/email.eml"
```

Leave `lambda-deploy-config.yml` unchanged because it is a focused deploy check.

- [ ] **Step 6: Preserve staged user changes**

Before committing, inspect `git status --short` and `git diff --cached -- server/src/models/workoutPlanModel.ts server/tests/models/workoutPlanTests.test.ts`. Do not unstage, amend, or include those existing workout-plan changes. Stage reporting paths explicitly.

- [ ] **Step 7: Verify and commit Server**

Run generic/workflow contract tests and the focused report tests; record existing unrelated full-suite failures.

```bash
git add tools/test-report test-report.config.mjs server/package.json server/package-lock.json .gitignore .github/workflows/server-tests.yml
git commit -m "ci: add readable emailed test reports"
```

Confirm the pre-existing workout-plan files remain staged outside this commit.

### Task 8: Document and verify all repositories

**Files:**
- Create in each repo: `docs/testing/test-results-reporting.md`
- Modify generic files only if verification finds a defect; copy every generic fix to all repositories.

**Interfaces:**
- Documents local commands, outputs, GitHub secrets, artifacts, and controlled failure checks.
- Proves shared source identity.

- [ ] **Step 1: Document local usage**

Document `npm run test:report`, `npm run test:report -- --suite "Unit tests"`, `--verbose`, artifact locations, and exit behavior.

- [ ] **Step 2: Document GitHub secrets without values**

```text
TEST_REPORT_SMTP_USER=<the Gmail address already used by the Server>
TEST_REPORT_SMTP_APP_PASSWORD=<the same Gmail app password used by the Server>
```

Explain repository secrets versus organization secrets restricted to the three repositories.

- [ ] **Step 3: Run generic tests in all repositories**

Run `node --test tools/test-report/__tests__/*.test.mjs` in each repo; expect PASS.

- [ ] **Step 4: Prove byte identity**

From `/Users/michael/Developer/Avihu`, run:

```bash
diff -ru Avihu-Team-Admin-App/tools/test-report Avihu-Team-Client-App/tools/test-report
diff -ru Avihu-Team-Admin-App/tools/test-report Avihu-Team-Server/tools/test-report
```

Expected: no output and exit `0` for both.

- [ ] **Step 5: Run repository verification**

```bash
cd Avihu-Team-Admin-App/frontend && npm run test:unit && npm run build
cd Avihu-Team-Client-App/frontend && npm run test:unit && npm run typecheck
cd Avihu-Team-Server/server && npm test -- --runInBand
```

Report every failure by suite name. Do not omit current unrelated Server failures.

- [ ] **Step 6: Inspect generated artifacts without local delivery**

Open each `report.html`; inspect `result.json`, `summary.md`, and `email.eml`. Confirm SMTP is invoked only by GitHub Actions.

- [ ] **Step 7: Commit docs separately per repo**

```bash
git add docs/testing/test-results-reporting.md
git commit -m "docs: explain test result reports"
```

- [ ] **Step 8: Controlled GitHub failure verification**

After secrets exist, make one temporary failing-test commit per repository. Confirm exactly one email, correct counts/links, downloadable artifact, failed workflow status, and no email on the successful follow-up. Remove the intentional failure in the next commit without rewriting history. Do not push these verification commits without explicit user direction.

### Task 9: Final review and handoff

**Files:** Review every changed path in all three repositories; create nothing unless verification finds a defect.

**Interfaces:** Produces exact commit, test, failure, and GitHub-secret handoff information.

- [ ] **Step 1: Inspect status and diffs**

Run `git status --short` and `git diff --check` in every repo. Verify no `.test-report/`, raw log, credential, or intentional failure is tracked.

- [ ] **Step 2: Review secret boundaries**

Confirm workflow references are only `${{ secrets.TEST_REPORT_SMTP_USER }}` and `${{ secrets.TEST_REPORT_SMTP_APP_PASSWORD }}`; confirm no environment dump is captured in a report.

- [ ] **Step 3: Run final verification**

Repeat generic tests in all repos, Admin unit/build, Client unit/typecheck, and Server focused reporter tests. Record exact counts and exit codes plus unrelated failures.

- [ ] **Step 4: Deliver setup instructions**

Tell the user to add the same existing Server Gmail values under the two new GitHub secret names in each repository or as scoped organization secrets. Link all workflow and operator-doc files.

- [ ] **Step 5: Offer controlled CI validation**

Offer to open the generated HTML report and, after secrets are configured, run the controlled failing workflow. Do not send a real email or push an intentional failure without explicit direction.
