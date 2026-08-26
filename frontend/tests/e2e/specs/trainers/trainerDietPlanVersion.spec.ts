import { expect, type Request, test } from "@playwright/test";
import { loginAsAdmin } from "../../utils/adminSession";
import { installMockApi } from "../../utils/mockApi";

test.setTimeout(60_000);

test("create Trainer sends the selected diet-plan version", async ({ page }) => {
  const createRequests: Request[] = [];
  const mockApi = await installMockApi(page);
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;

    if (request.method() === "POST" && pathname.endsWith("/trainers")) {
      createRequests.push(request);
    }
  });

  mockApi.useScenario(
    "auth.login.success",
    "auth.refresh.success",
    "analytics.dashboard.success",
    "users.success"
  );
  await loginAsAdmin(page);
  await expect(page).not.toHaveURL(/\/login$/);
  mockApi.useScenario(
    "analytics.dashboard.success",
    "auth.refresh.success",
    "users.success",
    "trainers.paginated.success",
    "trainers.create.success"
  );
  await page.goto("/trainers", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "הוסף מאמן" }).click();
  await page.getByLabel("שם מלא").fill("מאמן חדש");
  await page.getByLabel("אימייל").fill("new.trainer@example.com");
  await page.getByLabel("מספר טלפון").fill("0509876543");
  await page.getByLabel("סיסמה").fill("Secret123!");
  await page.getByTestId("trainer-diet-plan-version-create").click();
  await page.getByRole("option", { name: "V2" }).click();
  await page.getByRole("button", { name: "הוסף מאמן", exact: true }).click();

  await expect.poll(() => createRequests.length).toBe(1);
  expect(createRequests[0].postDataJSON()).toMatchObject({
    fullName: "מאמן חדש",
    dietPlanVersion: 2,
  });
  mockApi.assertNoUnhandledRequests();
});

test("edit Trainer shows the stored version disabled and omits it from updates", async ({
  page,
}) => {
  const updateRequests: Request[] = [];
  const mockApi = await installMockApi(page);
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname;

    if (request.method() === "PUT" && pathname.endsWith("/trainers/one")) {
      updateRequests.push(request);
    }
  });

  mockApi.useScenario(
    "auth.login.success",
    "auth.refresh.success",
    "analytics.dashboard.success",
    "users.success"
  );
  await loginAsAdmin(page);
  await expect(page).not.toHaveURL(/\/login$/);
  mockApi.useScenario(
    "analytics.dashboard.success",
    "auth.refresh.success",
    "users.success",
    "trainers.one.v2-success",
    "trainers.subtrainers.empty",
    "trainers.update.success"
  );
  await page.goto("/trainers/trainer-001", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: "ערוך מאמן" }).click();
  const versionControl = page.getByTestId("trainer-diet-plan-version-edit");

  await expect(versionControl).toBeVisible();
  await expect(versionControl).toBeDisabled();
  await expect(versionControl).toContainText("V2");

  await page.getByLabel("שם מלא").fill("מאמן מעודכן");
  await page.getByRole("button", { name: "שמור שינויים" }).click();

  await expect.poll(() => updateRequests.length).toBe(1);
  const updateBody = updateRequests[0].postDataJSON();
  expect(updateBody).toMatchObject({ fullName: "מאמן מעודכן" });
  expect(updateBody).not.toHaveProperty("dietPlanVersion");
  mockApi.assertNoUnhandledRequests();
});
