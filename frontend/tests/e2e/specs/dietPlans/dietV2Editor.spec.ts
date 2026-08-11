import { expect, test } from "@playwright/test";

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
    "users.one.success",
    "forms.responses.success",
    "forms.responses.latest.empty",
    "diet-plans.v2-catalog.success"
  );
  await page.goto(TRAINEE_PATH, { waitUntil: "domcontentloaded" });

  const editor = page.getByTestId("diet-v2-editor");
  await expect(editor).toBeVisible();

  return { editor, mockApi };
};

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
  await page.evaluate(() => {
    window.localStorage.setItem(
      "dietPlanV2:templates",
      JSON.stringify([
        {
          id: "template-001",
          name: "תבנית בדיקה",
          savedAt: "2026-08-11T12:00:00.000Z",
          mealsCount: 1,
          macros: { calories: 500, protein: 30, carbs: 50, fat: 15 },
          plan: {
            version: 2,
            highlights: "לשתות מים",
            meals: [
              {
                id: "template-meal-001",
                name: "ארוחת תבנית",
                categories: [
                  { category: "protein", items: [{ name: "טופו 200 גרם" }] },
                  { category: "carbs", items: [] },
                  { category: "fat", items: [] },
                  { category: "vegetables", items: [] },
                  { category: "addon", items: [] },
                ],
                macros: { calories: 500, protein: 30, carbs: 50, fat: 15 },
              },
            ],
          },
        },
      ])
    );
  });

  await editor.getByRole("button", { name: "תבניות" }).click();
  await page.getByRole("button", { name: /תבנית בדיקה/ }).click();

  await expect(editor.locator("input").first()).toHaveValue("ארוחת תבנית");
  await expect(editor.getByRole("button", { name: "שמור תפריט" })).toBeEnabled();
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
