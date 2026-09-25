import { expect, type Page, test } from "@playwright/test";
import {
  installMockApi,
  type MockApiController,
  type MockScenarioSelection,
} from "../utils/mockApi";
import { loginAsAdmin as performAdminLogin } from "../utils/adminSession";

const GOTO_OPTIONS = { waitUntil: "domcontentloaded" } as const;

test.setTimeout(60_000);

type SidebarDestination = {
  linkTestId: string;
  pathname: string;
  assertReady: (page: Page) => Promise<void>;
};

const normalizePathname = (pathname: string) => pathname.replace(/\/+$/, "") || "/";

const baseSidebarScenarios = (): MockScenarioSelection[] => [
  "auth.logout.success",
  "analytics.dashboard.success",
  "users.success",
  "blogs.success",
  "templates.diet.success",
  "templates.workouts.success",
  "leads.success",
  "forms.presets.success",
  "forms.responses.success",
  "agreements.signed.success",
  "trainers.subtrainers.empty",
];

const destinations: readonly SidebarDestination[] = [
  {
    linkTestId: "sidebar-link-users",
    pathname: "/users",
    assertReady: async (page) => {
      await expect(page.getByTestId("users-table")).toBeVisible();
    },
  },
  {
    linkTestId: "sidebar-link-blogs",
    pathname: "/blogs",
    assertReady: async (page) => {
      await expect(page.getByTestId("blogs-page")).toBeVisible();
    },
  },
  {
    linkTestId: "sidebar-link-dietPlans",
    pathname: "/dietPlans",
    assertReady: async (page) => {
      await expect(page.getByTestId("diet-plan-templates-page")).toBeVisible();
    },
  },
  {
    linkTestId: "sidebar-link-workoutPlans",
    pathname: "/workoutPlans",
    assertReady: async (page) => {
      await expect(page.getByTestId("workout-templates-page")).toBeVisible();
    },
  },
  {
    linkTestId: "sidebar-link-leads",
    pathname: "/leads",
    assertReady: async (page) => {
      await expect(page.getByTestId("leads-page")).toBeVisible();
    },
  },
  {
    linkTestId: "sidebar-link-form-builder",
    pathname: "/form-builder",
    assertReady: async (page) => {
      await expect(page.getByTestId("form-presets-page")).toBeVisible();
    },
  },
  {
    linkTestId: "sidebar-link-home",
    pathname: "/",
    assertReady: async (page) => {
      await expect(page.getByTestId("admin-dashboard")).toBeVisible();
    },
  },
] as const;

const expectPathname = async (page: Page, pathname: string) => {
  await expect
    .poll(() => normalizePathname(new URL(page.url()).pathname))
    .toBe(normalizePathname(pathname));
};

const loginAsAdmin = async (
  page: Page,
  mockApi: MockApiController,
  scenarioSelections: readonly MockScenarioSelection[] = baseSidebarScenarios()
) => {
  mockApi.useScenario("auth.login.success", "analytics.dashboard.success", "users.success");
  await performAdminLogin(page);

  await expectPathname(page, "/");
  await expect(page.getByTestId("admin-dashboard")).toBeVisible();

  mockApi.useScenario(...scenarioSelections);
};

const navigateToDestination = async (page: Page, destination: SidebarDestination) => {
  await page.getByTestId(destination.linkTestId).click();
  await expectPathname(page, destination.pathname);
  await destination.assertReady(page);
};

test.describe("sidebar routing", () => {
  test("navigates to every sidebar destination and reaches a ready state", async ({ page }) => {
    const mockApi = await installMockApi(page);

    await loginAsAdmin(page, mockApi);

    for (const destination of destinations) {
      await navigateToDestination(page, destination);
    }

    mockApi.assertNoUnhandledRequests();
  });

  test("preserves browser back and forward navigation between sidebar routes", async ({ page }) => {
    const mockApi = await installMockApi(page);

    await loginAsAdmin(page, mockApi);

    await navigateToDestination(page, destinations[0]);
    await navigateToDestination(page, destinations[1]);

    await page.goBack();
    await expectPathname(page, destinations[0].pathname);
    await destinations[0].assertReady(page);

    await page.goForward();
    await expectPathname(page, destinations[1].pathname);
    await destinations[1].assertReady(page);

    mockApi.assertNoUnhandledRequests();
  });
});

test.describe("sidebar async states", () => {
  test("loads the users screen after a delayed response", async ({ page }) => {
    const mockApi = await installMockApi(page);

    await loginAsAdmin(page, mockApi, [
      "analytics.dashboard.success",
      { key: "users.success", overrides: { delayMs: 700 } },
    ]);

    await page.getByTestId("sidebar-link-users").click();

    await expectPathname(page, "/users");
    await expect(page.getByTestId("users-table")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("shows loading before the blogs screen becomes ready", async ({ page }) => {
    const mockApi = await installMockApi(page);

    await loginAsAdmin(page, mockApi, [
      "analytics.dashboard.success",
      { key: "blogs.success", overrides: { delayMs: 700 } },
    ]);

    await page.getByTestId("sidebar-link-blogs").click();

    await expect(page.getByTestId("loader")).toBeVisible();
    await expectPathname(page, "/blogs");
    await expect(page.getByTestId("blogs-page")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("loads the forms screen after a delayed response", async ({ page }) => {
    const mockApi = await installMockApi(page);

    await loginAsAdmin(page, mockApi, [
      "analytics.dashboard.success",
      { key: "forms.presets.success", overrides: { delayMs: 700 } },
      "forms.responses.success",
      "agreements.signed.success",
    ]);

    await page.getByTestId("sidebar-link-form-builder").click();

    await expectPathname(page, "/form-builder");
    await expect(page.getByTestId("form-presets-page")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });
});

test.describe("sidebar controls", () => {
  test("expands the desktop sidebar on hover and collapses after leaving", async ({ page }) => {
    const mockApi = await installMockApi(page);

    await loginAsAdmin(page, mockApi);

    const sidebar = page.getByTestId("app-sidebar");
    await expect(sidebar).toHaveCSS("width", "76px");
    await sidebar.hover();
    await expect(sidebar).toHaveCSS("width", "240px");
    await page.getByTestId("admin-dashboard").hover();
    await expect(sidebar).toHaveCSS("width", "76px");

    mockApi.assertNoUnhandledRequests();
  });

  test("toggles the theme and persists the selected mode", async ({ page }) => {
    const mockApi = await installMockApi(page);

    await loginAsAdmin(page, mockApi);

    await page.getByTestId("sidebar-theme-toggle").click();

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("vite-ui-theme")))
      .toBe("dark");
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.getByTestId("sidebar-theme-toggle").click();

    await expect
      .poll(() => page.evaluate(() => localStorage.getItem("vite-ui-theme")))
      .toBe("light");
    await expect(page.locator("html")).toHaveClass(/light/);

    mockApi.assertNoUnhandledRequests();
  });

  test("logs out, clears session storage, and protects the app routes again", async ({ page }) => {
    const mockApi = await installMockApi(page);

    await loginAsAdmin(page, mockApi);
    await page.evaluate(() => sessionStorage.setItem("sidebar-session-check", "1"));

    await page.getByRole("button", { name: "חשבון משתמש" }).click();
    await page.getByTestId("sidebar-logout").click();

    await expectPathname(page, "/login");
    await expect(page.getByTestId("login-page")).toBeVisible();
    await expect(page.getByTestId("app-sidebar")).toHaveCount(0);
    await expect
      .poll(() => page.evaluate(() => sessionStorage.getItem("sidebar-session-check")))
      .toBeNull();

    await page.goto("/", GOTO_OPTIONS);
    await expectPathname(page, "/login");
    await expect(page.getByTestId("login-page")).toBeVisible();

    mockApi.assertNoUnhandledRequests();
  });

  test("logs out immediately even when the server logout is slow", async ({ page }) => {
    const mockApi = await installMockApi(page);

    await loginAsAdmin(page, mockApi, [
      { key: "auth.logout.success", overrides: { delayMs: 2_500 } },
      "analytics.dashboard.success",
      "users.success",
      "blogs.success",
      "templates.diet.success",
      "templates.workouts.success",
      "leads.success",
      "forms.presets.success",
      "forms.responses.success",
      "agreements.signed.success",
    ]);

    await page.getByRole("button", { name: "חשבון משתמש" }).click();
    await page.getByTestId("sidebar-logout").click();

    await expect
      .poll(() => normalizePathname(new URL(page.url()).pathname), { timeout: 1_000 })
      .toBe("/login");
    await expect(page.getByTestId("login-page")).toBeVisible();

    mockApi.assertNoUnhandledRequests();
  });
});
