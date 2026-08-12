import { expect, test, type Request } from "@playwright/test";

import { loginAsAdmin } from "../../utils/adminSession";
import { installMockApi } from "../../utils/mockApi";

const TRAINEE_PATH = "/users/user-001?tab=diet";
const CATALOG_ITEM_NAME = "100 גרם חזה עוף";

const openV2Editor = async (page: Parameters<typeof installMockApi>[0]) => {
  const mockApi = await installMockApi(page);
  mockApi.useScenario("auth.login.v2-success", "analytics.dashboard.success", "users.success");
  await loginAsAdmin(page);
  await expect(page.getByTestId("admin-dashboard")).toBeVisible();

  mockApi.useScenario(
    "auth.refresh.v2-success",
    "analytics.dashboard.success",
    "users.success",
    "users.one.trainee-success",
    "forms.responses.success",
    "forms.responses.latest.empty",
    "diet-plans.user.not-found",
    "diet-plans.v2-catalog.success",
    "diet-plans.v2-presets.success",
    "diet-plans.user.v2-save-success",
    "diet-plans.v2-presets.write-success"
  );
  await page.goto(TRAINEE_PATH, { waitUntil: "domcontentloaded" });

  const editor = page.getByTestId("diet-v2-editor");
  await expect(editor).toBeVisible();

  return { editor, mockApi };
};

const trackCatalogSearchRequests = (page: Parameters<typeof installMockApi>[0]) => {
  const requests: Request[] = [];

  page.on("request", (request) => {
    if (
      request.method() === "GET" &&
      new URL(request.url()).pathname.endsWith("/menuItems/v2/search")
    ) {
      requests.push(request);
    }
  });

  return requests;
};

test("V2 catalog search ignores one-character queries", async ({ page }) => {
  const requests = trackCatalogSearchRequests(page);
  const { editor, mockApi } = await openV2Editor(page);
  const input = editor
    .getByTestId("diet-v2-category-protein")
    .getByPlaceholder("חפש או כתוב מאכל ולחץ Enter…");

  await input.fill("c");
  await page.waitForTimeout(350);

  expect(requests).toHaveLength(0);
  mockApi.assertNoUnhandledRequests();
});

test("V2 catalog search sends only the settled term during typing", async ({ page }) => {
  const requests = trackCatalogSearchRequests(page);
  const { editor, mockApi } = await openV2Editor(page);
  const input = editor
    .getByTestId("diet-v2-category-protein")
    .getByPlaceholder("חפש או כתוב מאכל ולחץ Enter…");

  await input.pressSequentially("chicken", { delay: 225 });
  await page.waitForTimeout(400);

  expect(requests).toHaveLength(1);
  const url = new URL(requests[0].url());
  expect(url.searchParams.get("q")).toBe("chicken");
  expect(url.searchParams.get("category")).toBe("protein");
  mockApi.assertNoUnhandledRequests();
});

test("new V2 meals require all four macro inputs before saving", async ({ page }) => {
  const createRequests: Request[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname.endsWith("/dietPlans")) {
      createRequests.push(request);
    }
  });
  const { editor, mockApi } = await openV2Editor(page);

  await expect(editor.getByLabel("קלוריות", { exact: true })).toHaveValue("");
  await expect(editor.getByLabel("חלבון", { exact: true })).toHaveValue("");
  await expect(editor.getByLabel("פחמימה", { exact: true })).toHaveValue("");
  await expect(editor.getByLabel("שומן", { exact: true })).toHaveValue("");

  const proteinInput = editor
    .getByTestId("diet-v2-category-protein")
    .getByPlaceholder("חפש או כתוב מאכל ולחץ Enter…");
  await proteinInput.fill("טופו 200 גרם");
  await proteinInput.press("Enter");
  await editor.getByRole("button", { name: "שמור תפריט" }).click();

  await expect(editor.getByText("שדה חובה")).toHaveCount(4);
  expect(createRequests).toHaveLength(0);
  mockApi.assertNoUnhandledRequests();
});

test("V2 editor keeps quick add category-scoped and resets dirty state after save", async ({
  page,
}) => {
  const { editor, mockApi } = await openV2Editor(page);
  await expect(editor.getByRole("button", { name: "נשמר" })).toBeDisabled();
  await expect(editor.getByRole("button", { name: "הסר ארוחה" })).toBeDisabled();

  const protein = page.getByTestId("diet-v2-category-protein");
  const proteinInput = protein.getByPlaceholder("חפש או כתוב מאכל ולחץ Enter…");
  await proteinInput.fill("חזה עוף");
  await protein.getByRole("button", { name: `+ ${CATALOG_ITEM_NAME}` }).click();
  await expect(protein).toContainText(CATALOG_ITEM_NAME);

  await proteinInput.fill("200 גרם חזה עוף");
  await proteinInput.press("Enter");
  await expect(protein).toContainText("200 גרם חזה עוף");

  await proteinInput.fill(" 200  גרם חזה עוף ");
  await proteinInput.press("Enter");
  await expect(protein).toContainText("המאכל כבר קיים בקטגוריה הזו");

  const carbs = page.getByTestId("diet-v2-category-carbs");
  const carbsInput = carbs.getByPlaceholder("חפש או כתוב מאכל ולחץ Enter…");
  await carbsInput.fill("200 גרם חזה עוף");
  await carbsInput.press("Enter");
  await expect(carbs).toContainText("200 גרם חזה עוף");

  await editor.getByLabel("קלוריות", { exact: true }).fill("448");
  await editor.getByLabel("חלבון", { exact: true }).fill("25");
  await editor.getByLabel("פחמימה", { exact: true }).fill("45");
  await editor.getByLabel("שומן", { exact: true }).fill("12");

  await editor.getByRole("button", { name: "הוסף קלוריות חופשיות לארוחה" }).click();
  await editor.getByRole("spinbutton", { name: "קלוריות חופשיות", exact: true }).fill("150");
  await editor
    .getByRole("textbox", { name: "תיאור קלוריות חופשיות", exact: true })
    .fill("פרי / חטיף");

  const saveButton = editor.getByRole("button", { name: "שמור תפריט" });
  await expect(saveButton).toBeEnabled();
  await saveButton.click();
  await expect(editor.getByRole("button", { name: "נשמר" })).toBeDisabled();

  await editor.getByLabel("חלבון", { exact: true }).clear();
  await expect(editor.getByText("שדה חובה")).toBeVisible();
  await expect(editor.getByRole("button", { name: "שמור תפריט" })).toBeEnabled();

  await editor.getByLabel("חלבון", { exact: true }).fill("-1");
  await expect(editor.getByText("הערך חייב להיות 0 או יותר")).toBeVisible();
  await editor.getByRole("button", { name: "שמור תפריט" }).click();
  await expect(editor.getByRole("button", { name: "שמור תפריט" })).toBeEnabled();

  mockApi.assertNoUnhandledRequests();
});

test("applying a V2 template leaves the trainee plan dirty and saveable", async ({ page }) => {
  const { editor, mockApi } = await openV2Editor(page);

  await editor.getByRole("button", { name: "תבניות" }).click();
  await page.getByRole("button", { name: /תבנית V2 מהשרת/ }).click();

  await expect(editor.locator("input").first()).toHaveValue("ארוחת בוקר מהשרת");
  await expect(editor.getByRole("button", { name: "שמור תפריט" })).toBeEnabled();
  mockApi.assertNoUnhandledRequests();
});

test("saving a V2 template sends the current plan to the Server", async ({ page }) => {
  const { editor, mockApi } = await openV2Editor(page);
  const protein = editor.getByTestId("diet-v2-category-protein");
  const templateRequest = page.waitForRequest(
    (request) =>
      request.method() === "POST" && new URL(request.url()).pathname.endsWith("/presets/dietPlans")
  );

  await protein.getByPlaceholder("חפש או כתוב מאכל ולחץ Enter…").fill("טופו 200 גרם");
  await protein.getByPlaceholder("חפש או כתוב מאכל ולחץ Enter…").press("Enter");
  await editor.getByLabel("קלוריות", { exact: true }).fill("450");
  await editor.getByLabel("חלבון", { exact: true }).fill("30");
  await editor.getByLabel("פחמימה", { exact: true }).fill("50");
  await editor.getByLabel("שומן", { exact: true }).fill("12");
  await editor.getByRole("button", { name: "שמור כתבנית" }).click();
  await page.getByRole("button", { name: "שמור תבנית", exact: true }).click();

  const payload = (await templateRequest).postDataJSON();
  expect(payload).toMatchObject({ version: 2, name: "תבנית 1 ארוחות" });
  expect(payload.meals[0].categories[0].items).toContainEqual({ name: "טופו 200 גרם" });
  expect(payload).not.toHaveProperty("builtBy");
  expect(payload).not.toHaveProperty("notes");
  mockApi.assertNoUnhandledRequests();
});

test("V2 catalog items can be removed without changing existing plans", async ({ page }) => {
  const { editor, mockApi } = await openV2Editor(page);
  const protein = editor.getByTestId("diet-v2-category-protein");

  await protein.getByRole("button", { name: `הסר ${CATALOG_ITEM_NAME} מהקטלוג` }).click();
  await expect(page.getByText(`האם להסיר את “${CATALOG_ITEM_NAME}” מהקטלוג המשותף?`)).toBeVisible();

  const deleteRequest = page.waitForRequest(
    (request) =>
      request.method() === "DELETE" && new URL(request.url()).pathname.endsWith("/menuItems/v2/one")
  );
  await page.getByRole("button", { name: "הסר", exact: true }).click();
  expect((await deleteRequest).url()).toContain("id=catalog-protein-001");
  await expect(page.getByText("להסיר מהקטלוג?")).toHaveCount(0);

  mockApi.assertNoUnhandledRequests();
});
