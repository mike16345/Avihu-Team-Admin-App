import { expect, type Page, type Request, test } from "@playwright/test";

import { loginAsAdmin } from "../../utils/adminSession";
import { installMockApi, type MockApiController } from "../../utils/mockApi";

const PRESETS_PATH = "/dietPlans";
const PRESET_EDITOR_PATH = "/presets/dietPlans";
const EXISTING_PRESET_PATH = `${PRESET_EDITOR_PATH}/diet-preset-v2-001`;

const trackRequests = (page: Page, method: string, pathnameSuffix: string) => {
  const requests: Request[] = [];

  page.on("request", (request) => {
    if (request.method() === method && new URL(request.url()).pathname.endsWith(pathnameSuffix)) {
      requests.push(request);
    }
  });

  return requests;
};

const login = async (page: Page, mockApi: MockApiController, version: 1 | 2) => {
  mockApi.useScenario(
    version === 2 ? "auth.login.v2-success" : "auth.login.success",
    "analytics.dashboard.success",
    "users.success"
  );
  await loginAsAdmin(page);
};

test("an existing V2 preset stays V2 when the trainer is currently V1", async ({ page }) => {
  const mockApi = await installMockApi(page);
  const updateRequests = trackRequests(page, "PUT", "/presets/dietPlans/one");
  await login(page, mockApi, 1);

  mockApi.useScenario(
    "auth.refresh.success",
    "analytics.dashboard.success",
    "users.success",
    "diet-plans.v2-preset.one-success",
    "diet-plans.v2-catalog.success",
    "diet-plans.v2-presets.success",
    "diet-plans.v2-presets.write-success"
  );
  await page.goto(EXISTING_PRESET_PATH, { waitUntil: "domcontentloaded" });

  const editor = page.getByTestId("diet-v2-editor");
  await expect(editor).toBeVisible();
  await expect(page.locator('input[value="תבנית V2 מהשרת"]')).toBeVisible();
  await editor.getByLabel("חלבון", { exact: true }).fill("30");
  await editor.getByRole("button", { name: "שמור שינויים בתבנית" }).click();

  await expect.poll(() => updateRequests.length).toBe(1);
  expect(new URL(updateRequests[0].url()).searchParams.get("id")).toBe("diet-preset-v2-001");
  expect(updateRequests[0].postDataJSON()).toMatchObject({
    name: "תבנית V2 מהשרת",
    version: 2,
  });
  mockApi.assertNoUnhandledRequests();
});

test("creating a V2 preset writes it to the Server", async ({ page }) => {
  const mockApi = await installMockApi(page);
  const createRequests = trackRequests(page, "POST", "/presets/dietPlans");
  await login(page, mockApi, 2);

  mockApi.useScenario(
    "auth.refresh.v2-success",
    "analytics.dashboard.success",
    "users.success",
    "diet-plans.v2-catalog.success",
    "diet-plans.v2-presets.success",
    "diet-plans.v2-presets.write-success"
  );
  await page.goto(PRESET_EDITOR_PATH, { waitUntil: "domcontentloaded" });

  const editor = page.getByTestId("diet-v2-editor");
  const proteinInput = editor
    .getByTestId("diet-v2-category-protein")
    .getByPlaceholder("חפש או כתוב מאכל ולחץ Enter…");
  await proteinInput.fill("טופו 200 גרם");
  await proteinInput.press("Enter");
  await editor.getByLabel("קלוריות", { exact: true }).fill("450");
  await editor.getByLabel("חלבון", { exact: true }).fill("30");
  await editor.getByLabel("פחמימה", { exact: true }).fill("50");
  await editor.getByLabel("שומן", { exact: true }).fill("12");
  await editor.getByRole("button", { name: "שמור שינויים בתבנית" }).click();

  await expect.poll(() => createRequests.length).toBe(1);
  expect(createRequests[0].postDataJSON()).toMatchObject({
    name: "תבנית חדשה",
    version: 2,
  });
  mockApi.assertNoUnhandledRequests();
});

test("deleting a V2 preset removes it through the Server", async ({ page }) => {
  const mockApi = await installMockApi(page);
  const deleteRequests = trackRequests(page, "DELETE", "/presets/dietPlans/one");
  await login(page, mockApi, 2);

  mockApi.useScenario(
    "auth.refresh.v2-success",
    "analytics.dashboard.success",
    "users.success",
    "diet-plans.v2-presets.success",
    "diet-plans.v2-presets.write-success"
  );
  await page.goto(PRESETS_PATH, { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "מחק תבנית" }).click();
  await page.getByRole("button", { name: "מחק תבנית", exact: true }).last().click();

  await expect.poll(() => deleteRequests.length).toBe(1);
  expect(new URL(deleteRequests[0].url()).searchParams.get("id")).toBe("diet-preset-v2-001");
  mockApi.assertNoUnhandledRequests();
});

test("the V1 preset catalog requests the Server's explicit V1 collection", async ({ page }) => {
  const mockApi = await installMockApi(page);
  const listRequests = trackRequests(page, "GET", "/presets/dietPlans");
  await login(page, mockApi, 1);

  mockApi.useScenario(
    "auth.refresh.success",
    "analytics.dashboard.success",
    "users.success",
    "trainers.subtrainers.empty",
    "diet-plans.success",
    "diet-plans.food-groups.success"
  );
  await page.goto(PRESETS_PATH, { waitUntil: "domcontentloaded" });

  await expect.poll(() => listRequests.length).toBe(1);
  expect(new URL(listRequests[0].url()).searchParams.get("version")).toBe("1");
  mockApi.assertNoUnhandledRequests();
});
