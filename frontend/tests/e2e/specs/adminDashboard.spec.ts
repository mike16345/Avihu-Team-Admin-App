import { expect, type Page, test } from "@playwright/test";
import { type MockScenarioKey, useMockApi as installPageMockApi } from "../utils/mockApi";
import { loginAsAdmin } from "../utils/adminSession";

const loginToDashboard = async (page: Page, scenarioKeys: MockScenarioKey[]) => {
  const mockApi = await installPageMockApi(page, [
    "auth.login.success",
    "users.success",
    ...scenarioKeys,
  ]);

  await loginAsAdmin(page);
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

    await expect(page.getByRole("button", { name: /מתאמן חדש/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /תפריט תזונה/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /תוכנית אימון/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /מאמר חדש/ })).toBeVisible();
    await expect(page.getByText("כל המתאמנים נבדקו!")).toBeVisible();
    await expect(page.getByText("כל הלקוחות מוגדרים!")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("renders populated analytics data", async ({ page }) => {
    const mockApi = await loginToDashboard(page, [
      "analytics.dashboard.populated",
      "users.dashboard-populated",
    ]);
    const dashboard = page.getByTestId("admin-dashboard");

    await expect(dashboard.getByText("מיכל כהן", { exact: true }).first()).toBeVisible();
    await expect(dashboard.getByText("דניאל לוי", { exact: true }).first()).toBeVisible();
    await expect(dashboard.getByText("נועה אברהם", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("כל המתאמנים נבדקו!")).toHaveCount(0);
    await expect(page.getByText("כל הלקוחות מוגדרים!")).toHaveCount(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("navigates to add user from the primary shortcut", async ({ page }) => {
    const mockApi = await loginToDashboard(page, ["analytics.dashboard.success"]);
    mockApi.addScenario("trainers.subtrainers.empty");

    await page.getByRole("button", { name: /מתאמן חדש/ }).click();

    await expect(page).toHaveURL(/\/users\/add$/);
    await expect(page.getByTestId("user-form-page")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });
});
