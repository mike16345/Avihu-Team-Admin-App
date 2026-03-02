import { expect, type Page, test } from "@playwright/test";
import { type MockScenarioKey, useMockApi as installPageMockApi } from "../utils/mockApi";

const LOGIN_PATH = "/login";

const loginToDashboard = async (page: Page, scenarioKeys: MockScenarioKey[]) => {
  const mockApi = await installPageMockApi(page, ["auth.login.success", ...scenarioKeys]);

  await page.goto(LOGIN_PATH);
  await page.getByTestId("login-email").fill("admin@example.com");
  await page.getByTestId("login-password").fill("Secret123!");
  await page.getByTestId("login-submit").click();
  await expect(page.getByTestId("admin-dashboard")).toBeVisible();

  return mockApi;
};

test.describe("admin dashboard", () => {
  test("redirects unauthenticated visitors to login", async ({ page }) => {
    const mockApi = await installPageMockApi(page, []);

    await page.goto("/");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-page")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("renders dashboard shortcuts and empty analytics states", async ({ page }) => {
    const mockApi = await loginToDashboard(page, ["analytics.dashboard.success"]);

    await expect(page.getByText("הוסף משתמש")).toBeVisible();
    await expect(page.getByText("הוסף תפריט")).toBeVisible();
    await expect(page.getByText("הוסף תבנית אימון")).toBeVisible();
    await expect(page.getByText("הוסף פוסט")).toBeVisible();
    await expect(page.getByText("לא נשארו לקוחות לבדיקה!")).toBeVisible();
    await expect(page.getByText("אין נתונים להצגה!").first()).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("renders populated analytics data", async ({ page }) => {
    const mockApi = await loginToDashboard(page, ["analytics.dashboard.populated"]);

    await expect(page.getByText("מיכל").first()).toBeVisible();
    await expect(page.getByText("כהן").first()).toBeVisible();
    await expect(page.getByText("דניאל").first()).toBeVisible();
    await expect(page.getByText("לוי").first()).toBeVisible();
    await expect(page.getByText("נועה אברהם").first()).toBeVisible();
    await expect(page.getByText("אין נתונים להצגה!")).toHaveCount(0);
    await expect(page.getByText("לא נשארו לקוחות לבדיקה!")).toHaveCount(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("navigates to add user from the primary shortcut", async ({ page }) => {
    const mockApi = await loginToDashboard(page, ["analytics.dashboard.success"]);

    await page.getByText("הוסף משתמש").click();

    await expect(page).toHaveURL(/\/users\/add$/);
    await expect(page.getByText("פרטי משתמש")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });
});
