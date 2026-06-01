import { expect, type Page, type Request, test } from "@playwright/test";
import {
  installMockApi,
  type MockApiController,
  type MockScenarioSelection,
} from "../utils/mockApi";
import { loginAsAdmin } from "../utils/adminSession";

const LOGIN_PATH = "/login";
const DASHBOARD_PATH = "/";
const DIET_PLANS_PATH = "/dietPlans";
const DIET_PLAN_EDITOR_PATH = "/presets/dietPlans";
const GOTO_OPTIONS = { waitUntil: "domcontentloaded" } as const;

test.setTimeout(60_000);

const normalizePathname = (pathname: string) => pathname.replace(/\/+$/, "") || "/";

const defaultDietPlansScenarios = (): MockScenarioSelection[] => [
  "diet-plans.success",
  "diet-plans.food-groups.success",
];

const expectPathname = async (page: Page, pathname: string) => {
  await expect
    .poll(() => normalizePathname(new URL(page.url()).pathname))
    .toBe(normalizePathname(pathname));
};

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

const openDietPlansDirectly = async (
  page: Page,
  mockApi: MockApiController,
  scenarioSelections: readonly MockScenarioSelection[] = defaultDietPlansScenarios()
) => {
  mockApi.useScenario("auth.login.success", "analytics.dashboard.success");
  await loginAsAdmin(page);

  await expectPathname(page, DASHBOARD_PATH);
  await expect(page.getByTestId("admin-dashboard")).toBeVisible();

  mockApi.useScenario("analytics.dashboard.success", ...scenarioSelections);
  await page.goto(DIET_PLANS_PATH, GOTO_OPTIONS);

  await expectPathname(page, DIET_PLANS_PATH);
  await expect(page.getByTestId("diet-plan-templates-page")).toBeVisible();
};

const openDietPlansFromSidebar = async (
  page: Page,
  mockApi: MockApiController,
  scenarioSelections: readonly MockScenarioSelection[] = defaultDietPlansScenarios()
) => {
  mockApi.useScenario("auth.login.success", "analytics.dashboard.success");
  await loginAsAdmin(page);

  await expectPathname(page, DASHBOARD_PATH);
  await expect(page.getByTestId("admin-dashboard")).toBeVisible();

  mockApi.useScenario("analytics.dashboard.success", ...scenarioSelections);
  await page.getByTestId("sidebar-link-dietPlans").click();

  await expectPathname(page, DIET_PLANS_PATH);
  await expect(page.getByTestId("diet-plan-templates-page")).toBeVisible();
};

const getDietPlansRows = (page: Page) => page.locator('tr[data-testid^="diet-plan-presets-row-"]');
const getFoodGroupRows = (page: Page) => page.locator('tr[data-testid^="protein-row-"]');

const getDietPlansSearchInput = (page: Page) =>
  page.getByTestId("diet-plan-presets-search-container").getByRole("textbox");

const openFoodGroupTab = async (page: Page) => {
  await page.getByTestId("template-tab-protein").click();
  await expect(page.getByTestId("protein-table")).toBeVisible();
};

test.describe("diet plans page routing and entry", () => {
  test("redirects unauthenticated visitors to login", async ({ page }) => {
    const mockApi = await installMockApi(page);

    await page.goto(DIET_PLANS_PATH, GOTO_OPTIONS);

    await expectPathname(page, LOGIN_PATH);
    await expect(page.getByTestId("login-page")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("loads on direct authenticated navigation", async ({ page }) => {
    const mockApi = await installMockApi(page);

    await openDietPlansDirectly(page, mockApi);

    await expect(page.getByTestId("diet-plan-presets-table")).toBeVisible();
    await expect(getDietPlansRows(page)).toHaveCount(2);
    mockApi.assertNoUnhandledRequests();
  });

  test("loads from the sidebar nav link", async ({ page }) => {
    const mockApi = await installMockApi(page);

    await openDietPlansFromSidebar(page, mockApi);

    await expect(page.getByTestId("diet-plan-presets-table")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("supports browser back and forward after opening from the sidebar", async ({ page }) => {
    const mockApi = await installMockApi(page);

    await openDietPlansFromSidebar(page, mockApi);

    await page.goBack();
    await expectPathname(page, DASHBOARD_PATH);
    await expect(page.getByTestId("admin-dashboard")).toBeVisible();

    await page.goForward();
    await expectPathname(page, DIET_PLANS_PATH);
    await expect(page.getByTestId("diet-plan-presets-table")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });
});

test.describe("diet plans page data states", () => {
  let mockApi: MockApiController;

  test.beforeEach(async ({ page }) => {
    mockApi = await installMockApi(page);
  });

  test("shows the loading skeleton while the initial presets query is delayed", async ({
    page,
  }) => {
    await openDietPlansDirectly(page, mockApi, [
      { key: "diet-plans.success", overrides: { delayMs: 800 } },
      "diet-plans.food-groups.success",
    ]);

    await expect(page.getByTestId("template-tabs-skeleton")).toBeVisible();
    await expect(page.getByTestId("diet-plan-presets-table")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("renders an empty state for an empty presets response", async ({ page }) => {
    await openDietPlansDirectly(page, mockApi, [
      "diet-plans.empty",
      "diet-plans.food-groups.success",
    ]);

    await expect(page.getByTestId("diet-plan-presets-table")).toBeVisible();
    await expect(getDietPlansRows(page)).toHaveCount(0);
    await expect(page.getByTestId("error-page")).toHaveCount(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("treats a null presets payload as an empty state", async ({ page }) => {
    await openDietPlansDirectly(page, mockApi, [
      "diet-plans.null-data",
      "diet-plans.food-groups.success",
    ]);

    await expect(page.getByTestId("diet-plan-presets-table")).toBeVisible();
    await expect(getDietPlansRows(page)).toHaveCount(0);
    await expect(page.getByTestId("error-page")).toHaveCount(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("treats a 404 presets response as an empty state", async ({ page }) => {
    await openDietPlansDirectly(page, mockApi, [
      "diet-plans.error-404",
      "diet-plans.food-groups.success",
    ]);

    await expect(page.getByTestId("diet-plan-presets-table")).toBeVisible();
    await expect(getDietPlansRows(page)).toHaveCount(0);
    await expect(page.getByTestId("error-page")).toHaveCount(0);
    mockApi.assertNoUnhandledRequests();
  });

  for (const scenario of [
    "diet-plans.error-400",
    "diet-plans.error-401",
    "diet-plans.error-403",
    "diet-plans.error-500",
  ] as const) {
    test(`renders the error page for ${scenario}`, async ({ page }) => {
      await openDietPlansDirectly(page, mockApi, [scenario, "diet-plans.food-groups.success"]);

      await expect(page.getByTestId("error-page")).toBeVisible();
      mockApi.assertNoUnhandledRequests();
    });
  }

  test("renders the error page when the presets request fails at the network layer", async ({
    page,
  }) => {
    await openDietPlansDirectly(page, mockApi, [
      "diet-plans.network-failure",
      "diet-plans.food-groups.success",
    ]);

    await expect(page.getByTestId("error-page")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("renders the food-group table after switching tabs", async ({ page }) => {
    await openDietPlansDirectly(page, mockApi);

    await openFoodGroupTab(page);

    await expect(getFoodGroupRows(page)).toHaveCount(2);
    mockApi.assertNoUnhandledRequests();
  });

  test("treats a 404 food-group response as an empty state", async ({ page }) => {
    await openDietPlansDirectly(page, mockApi, [
      "diet-plans.success",
      "diet-plans.food-groups.error-404",
    ]);

    await openFoodGroupTab(page);

    await expect(getFoodGroupRows(page)).toHaveCount(0);
    await expect(page.getByTestId("error-page")).toHaveCount(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("renders the error page for a food-group 500 response", async ({ page }) => {
    await openDietPlansDirectly(page, mockApi, [
      "diet-plans.success",
      "diet-plans.food-groups.error-500",
    ]);

    await page.getByTestId("template-tab-protein").click();

    await expect(page.getByTestId("error-page")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });
});

test.describe("diet plans page interactions", () => {
  let mockApi: MockApiController;

  test.beforeEach(async ({ page }) => {
    mockApi = await installMockApi(page);
  });

  test("filters the presets list from the search input", async ({ page }) => {
    await openDietPlansDirectly(page, mockApi, [
      "diet-plans.large",
      "diet-plans.food-groups.success",
    ]);

    await getDietPlansSearchInput(page).fill("Diet Plan 12");

    await expect(page.getByTestId("diet-plan-presets-row-diet-plan-012")).toBeVisible();
    await expect(page.getByTestId("diet-plan-presets-row-diet-plan-001")).toHaveCount(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("paginates large preset lists", async ({ page }) => {
    await openDietPlansDirectly(page, mockApi, [
      "diet-plans.large",
      "diet-plans.food-groups.success",
    ]);

    await expect(page.getByTestId("diet-plan-presets-row-diet-plan-001")).toBeVisible();
    await expect(page.getByTestId("diet-plan-presets-row-diet-plan-011")).toHaveCount(0);

    await page.getByTestId("diet-plan-presets-next-page").click();

    await expect(page.getByTestId("diet-plan-presets-row-diet-plan-011")).toBeVisible();
    await expect(page.getByTestId("diet-plan-presets-row-diet-plan-001")).toHaveCount(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("navigates to the diet-plan editor from the add button on the presets tab", async ({
    page,
  }) => {
    await openDietPlansDirectly(page, mockApi);
    mockApi.addScenario("diet-plans.editor.success");

    await page.getByTestId("template-add-dietplanpresets").click();

    await expectPathname(page, DIET_PLAN_EDITOR_PATH);
    await expect(page.getByTestId("diet-plan-preset-page")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("opens and closes the food-group sheet from the add button", async ({ page }) => {
    await openDietPlansDirectly(page, mockApi);

    await openFoodGroupTab(page);
    await page.getByTestId("template-add-proteinitems").click();

    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("sends a delete request for a diet-plan preset", async ({ page }) => {
    const deleteRequests = trackRequests(page, "DELETE", "/presets/dietPlans/one");

    await openDietPlansDirectly(page, mockApi);
    mockApi.addScenario("diet-plans.delete.success");

    await page.getByTestId("diet-plan-presets-row-diet-plan-001-actions-trigger").click();
    await page.getByTestId("diet-plan-presets-row-diet-plan-001-delete").click();

    await expect.poll(() => deleteRequests.length).toBe(1);
    await expect(page.getByTestId("diet-plan-presets-table")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("sends a delete request for a food-group item", async ({ page }) => {
    const deleteRequests = trackRequests(page, "DELETE", "/menuItems/one");

    await openDietPlansDirectly(page, mockApi);
    mockApi.addScenario("diet-plans.food-groups.delete.success");

    await openFoodGroupTab(page);
    await page.getByTestId("protein-row-menu-item-001-actions-trigger").click();
    await page.getByTestId("protein-row-menu-item-001-delete").click();

    await expect.poll(() => deleteRequests.length).toBe(1);
    await expect(page.getByTestId("protein-table")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });
});
