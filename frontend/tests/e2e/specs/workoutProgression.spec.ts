import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "../utils/adminSession";
import { installMockApi } from "../utils/mockApi";

test("shows RIR in compact and detailed workout history", async ({ page }) => {
  const mockApi = await installMockApi(page);
  mockApi.useScenario("auth.login.success", "analytics.dashboard.success");
  await loginAsAdmin(page);

  mockApi.useScenario(
    "auth.refresh.success",
    "analytics.dashboard.success",
    "users.success",
    "users.one.success",
    "weigh-ins.user.empty",
    "recorded-sets.user.rir"
  );
  await page.goto("/users", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "פתח את הפרופיל של Alice Cohen" }).click();
  await page.getByRole("button", { name: "כוח" }).click();

  await page.getByRole("button", { name: "ראה היסטוריה מלאה" }).click();
  await expect(page.getByRole("columnheader", { name: "RIR" })).toBeVisible();
  await expect(page.getByTestId("exercise-history-rir")).toHaveText(["1", "—", "0", "2"]);

  await page
    .getByRole("button", { name: /לחיצת חזה/ })
    .first()
    .click();
  await expect(page.getByTestId("exercise-detail-rir")).toHaveText(["RIR 1", "RIR 0"]);
  await expect(page.getByTestId("exercise-detail-rir")).toHaveCount(2);
  mockApi.assertNoUnhandledRequests();
});
