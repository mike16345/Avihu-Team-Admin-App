import { expect, type Page, test } from "@playwright/test";
import { installMockApi, type MockScenarioSelection } from "../utils/mockApi";
import { loginAsAdmin } from "../utils/adminSession";

const USERS_PATH = "/users";
const GOTO_OPTIONS = { waitUntil: "domcontentloaded" } as const;

test.setTimeout(60_000);

const getUserRow = (page: Page, userId: string) => page.getByTestId(`users-row-${userId}`);
const getUserRows = (page: Page) => page.locator('[data-testid^="users-row-user-"]');

const expectUsersUrl = async (page: Page) => {
  await expect.poll(() => new URL(page.url()).pathname).toBe(USERS_PATH);
};

const openUsersDirectly = async (
  page: Page,
  scenarioSelections: MockScenarioSelection[],
  options: { expectTable?: boolean } = {}
) => {
  const mockApi = await installMockApi(page);

  mockApi.useScenario("auth.login.success", "analytics.dashboard.success", "users.success");
  await loginAsAdmin(page);

  await expect(page).not.toHaveURL(/\/login$/);
  await expect(page.getByTestId("sidebar-link-users")).toBeVisible();

  mockApi.useScenario("auth.refresh.success", "analytics.dashboard.success", ...scenarioSelections);
  await page.goto(USERS_PATH, GOTO_OPTIONS);

  if (options.expectTable !== false) {
    await expect(page.getByTestId("users-table")).toBeAttached();
    await expectUsersUrl(page);
  }

  return mockApi;
};

const openUsersFromSidebar = async (page: Page, scenarioSelections: MockScenarioSelection[]) => {
  const mockApi = await installMockApi(page);

  mockApi.useScenario("auth.login.success", "analytics.dashboard.success", "users.success");
  await loginAsAdmin(page);

  await expect(page).not.toHaveURL(/\/login$/);
  await expect(page.getByTestId("sidebar-link-users")).toBeVisible();

  mockApi.useScenario("auth.refresh.success", "analytics.dashboard.success", ...scenarioSelections);
  await page.getByTestId("sidebar-link-users").click();

  await expect(page.getByTestId("users-table")).toBeVisible();
  await expectUsersUrl(page);

  return mockApi;
};

test.describe("users page routing and entry", () => {
  test("redirects unauthenticated visitors to login", async ({ page }) => {
    const mockApi = await installMockApi(page);

    await page.goto(USERS_PATH, GOTO_OPTIONS);

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-page")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("loads users on direct navigation after authentication", async ({ page }) => {
    const mockApi = await openUsersDirectly(page, ["users.success"]);

    await expect(getUserRow(page, "user-001")).toBeVisible();
    await expect(getUserRow(page, "user-002")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("navigates to users from the sidebar", async ({ page }) => {
    const mockApi = await openUsersFromSidebar(page, ["users.success"]);

    await expect(getUserRow(page, "user-001")).toBeVisible();
    await expect(getUserRow(page, "user-002")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });
});

test.describe("users page data states", () => {
  test("shows a loading indicator while the users response is delayed", async ({ page }) => {
    const mockApi = await openUsersDirectly(
      page,
      [{ key: "users.success", overrides: { delayMs: 800 } }],
      { expectTable: false }
    );

    await expect(page.getByTestId("loader")).toBeVisible();
    await expect(page.getByTestId("users-table")).toBeVisible();
    await expectUsersUrl(page);
    mockApi.assertNoUnhandledRequests();
  });

  test("renders an empty table state when no users are returned", async ({ page }) => {
    const mockApi = await openUsersDirectly(page, ["users.empty"]);

    await expect(getUserRows(page)).toHaveCount(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("renders the error page for malformed user payloads", async ({ page }) => {
    const mockApi = await openUsersDirectly(page, ["users.malformed"], { expectTable: false });

    await expect(page.getByTestId("error-page")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  for (const scenario of [
    "users.error-400",
    "users.error-401",
    "users.error-403",
    "users.error-404",
    "users.error-500",
  ] as const) {
    test(`renders the error page for ${scenario} responses`, async ({ page }) => {
      const mockApi = await openUsersDirectly(page, [scenario], { expectTable: false });

      await expect(page.getByTestId("error-page")).toBeVisible();
      mockApi.assertNoUnhandledRequests();
    });
  }

  test("renders the error page for network failures", async ({ page }) => {
    const mockApi = await openUsersDirectly(page, ["users.network-failure"], {
      expectTable: false,
    });

    await expect(page.getByTestId("error-page")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });
});

test.describe("users page interactions", () => {
  test("filters rows from the search input", async ({ page }) => {
    const mockApi = await openUsersDirectly(page, ["users.success"]);

    await page.getByTestId("users-search").fill("Alice");

    await expect(getUserRow(page, "user-001")).toBeVisible();
    await expect(getUserRow(page, "user-002")).toHaveCount(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("renders large datasets without hiding later users", async ({ page }) => {
    const mockApi = await openUsersDirectly(page, ["users.large"]);

    await expect(getUserRow(page, "user-001")).toBeVisible();
    await expect(getUserRow(page, "user-021")).toBeVisible();
    await expect(getUserRows(page)).toHaveCount(21);
    mockApi.assertNoUnhandledRequests();
  });
});
