import { expect, type Page, type Request, test } from "@playwright/test";

import { loginAsAdmin } from "../../utils/adminSession";
import {
  installMockApi,
  type MockApiController,
  type MockScenarioSelection,
} from "../../utils/mockApi";

const TRAINEE_PATH = "/users/user-001?tab=diet";

const trackRequests = (page: Page, method: string, pathnameSuffix: string) => {
  const requests: Request[] = [];

  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;

    if (request.method() === method && pathname.endsWith(pathnameSuffix)) {
      requests.push(request);
    }
  });

  return requests;
};

const openTraineeDiet = async (
  page: Page,
  mockApi: MockApiController,
  authScenario: "v1" | "v2",
  planScenario: MockScenarioSelection,
  extraScenarios: MockScenarioSelection[] = []
) => {
  const loginScenario = authScenario === "v2" ? "auth.login.v2-success" : "auth.login.success";
  const refreshScenario =
    authScenario === "v2" ? "auth.refresh.v2-success" : "auth.refresh.success";

  mockApi.useScenario(loginScenario, "analytics.dashboard.success", "users.success");
  await loginAsAdmin(page);

  mockApi.useScenario(
    refreshScenario,
    "analytics.dashboard.success",
    "users.success",
    "users.one.trainee-success",
    "forms.responses.success",
    "forms.responses.latest.empty",
    planScenario,
    ...extraScenarios
  );
  await page.goto(TRAINEE_PATH, { waitUntil: "domcontentloaded" });
};

test("an existing V2 plan stays in the V2 editor after its trainer switches to V1", async ({
  page,
}) => {
  const mockApi = await installMockApi(page);

  await openTraineeDiet(page, mockApi, "v1", "diet-plans.user.v2-success", [
    "diet-plans.v2-catalog.success",
    "diet-plans.v2-presets.success",
  ]);

  await expect(page.getByTestId("diet-v2-editor")).toBeVisible();
  await expect(page.locator('input[value="ארוחת בוקר מהשרת"]')).toBeVisible();
  mockApi.assertNoUnhandledRequests();
});

test("the direct user diet-plan route also honors the stored V2 version", async ({ page }) => {
  const mockApi = await installMockApi(page);
  mockApi.useScenario("auth.login.success", "analytics.dashboard.success", "users.success");
  await loginAsAdmin(page);

  mockApi.useScenario(
    "auth.refresh.success",
    "analytics.dashboard.success",
    "users.success",
    "users.one.trainee-success",
    "forms.responses.latest.empty",
    "diet-plans.user.v2-success",
    "diet-plans.v2-catalog.success",
    "diet-plans.v2-presets.success"
  );
  await page.goto("/diet-plans/user-001", { waitUntil: "domcontentloaded" });

  await expect(page.getByTestId("diet-v2-editor")).toBeVisible();
  await expect(page.locator('input[value="ארוחת בוקר מהשרת"]')).toBeVisible();
  mockApi.assertNoUnhandledRequests();
});

test("an existing V1 plan stays in the V1 editor after its trainer switches to V2", async ({
  page,
}) => {
  const mockApi = await installMockApi(page);

  await openTraineeDiet(page, mockApi, "v2", "diet-plans.user.v1-success", [
    "diet-plans.success",
    "diet-plans.editor.success",
    "trainers.subtrainers.empty",
  ]);

  await expect(page.getByTestId("diet-v2-editor")).toHaveCount(0);
  await expect(page.getByText("קלוריות חופשיות", { exact: true })).toBeVisible();
  mockApi.assertNoUnhandledRequests();
});

test("a trainer's current version chooses the editor only when the trainee has no plan", async ({
  page,
}) => {
  const mockApi = await installMockApi(page);

  await openTraineeDiet(page, mockApi, "v2", "diet-plans.user.not-found", [
    "diet-plans.v2-catalog.success",
    "diet-plans.v2-presets.success",
  ]);

  await expect(page.getByTestId("diet-v2-editor")).toBeVisible();
  mockApi.assertNoUnhandledRequests();
});

test("a Server error does not get mistaken for a missing plan", async ({ page }) => {
  const mockApi = await installMockApi(page);

  await openTraineeDiet(page, mockApi, "v2", "diet-plans.user.error-500");

  await expect(page.getByTestId("error-page")).toBeVisible();
  await expect(page.getByTestId("diet-v2-editor")).toHaveCount(0);
  mockApi.assertNoUnhandledRequests();
});

test("a newly-created V2 plan uses update on its next save", async ({ page }) => {
  const mockApi = await installMockApi(page);
  const createRequests = trackRequests(page, "POST", "/dietPlans");
  const updateRequests = trackRequests(page, "PUT", "/dietPlans/one/user");

  await openTraineeDiet(page, mockApi, "v2", "diet-plans.user.not-found", [
    "diet-plans.v2-catalog.success",
    "diet-plans.v2-presets.success",
    "diet-plans.user.v2-save-success",
  ]);

  const editor = page.getByTestId("diet-v2-editor");
  const protein = editor.getByTestId("diet-v2-category-protein");
  const proteinInput = protein.getByPlaceholder("חפש או כתוב מאכל ולחץ Enter…");
  await proteinInput.fill("טופו 200 גרם");
  await proteinInput.press("Enter");
  await editor.getByRole("button", { name: "שמור תפריט" }).click();
  await expect.poll(() => createRequests.length).toBe(1);

  await editor.getByLabel("חלבון", { exact: true }).fill("30");
  await editor.getByRole("button", { name: "שמור תפריט" }).click();
  await expect.poll(() => updateRequests.length).toBe(1);
  mockApi.assertNoUnhandledRequests();
});

test("saving an existing V2 plan replaces it through the user-scoped Server route", async ({
  page,
}) => {
  const mockApi = await installMockApi(page);
  const saveRequests = trackRequests(page, "PUT", "/dietPlans/one/user");

  await openTraineeDiet(page, mockApi, "v1", "diet-plans.user.v2-success", [
    "diet-plans.v2-catalog.success",
    "diet-plans.v2-presets.success",
    "diet-plans.user.v2-save-success",
  ]);

  const editor = page.getByTestId("diet-v2-editor");
  await editor.getByLabel("חלבון", { exact: true }).fill("30");
  await editor.getByRole("button", { name: "שמור תפריט" }).click();

  await expect.poll(() => saveRequests.length).toBe(1);
  const requestUrl = new URL(saveRequests[0].url());
  expect(requestUrl.searchParams.get("id")).toBe("user-001");
  expect(saveRequests[0].postDataJSON()).toMatchObject({ version: 2 });
  await expect(editor.getByRole("button", { name: "נשמר" })).toBeDisabled();
  mockApi.assertNoUnhandledRequests();
});
