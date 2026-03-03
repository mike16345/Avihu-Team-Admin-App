import { expect, type Page, type Request, test } from "@playwright/test";
import { installMockApi, type MockApiController } from "../utils/mockApi";

const LOGIN_PATH = "/login";
const USERS_PATH = "/users";
const ADD_USER_PATH = "/users/add";
const GOTO_OPTIONS = { waitUntil: "domcontentloaded" } as const;

test.setTimeout(60_000);

const normalizePathname = (pathname: string) => pathname.replace(/\/+$/, "") || "/";

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

const expectAddUserPage = async (page: Page) => {
  await expect.poll(() => new URL(page.url()).pathname).toBe(ADD_USER_PATH);
  await expect(page.getByTestId("user-form-page")).toBeVisible();
  await expect(page.getByTestId("user-form")).toBeVisible();
  await expect(page.getByTestId("user-form-submit")).toBeVisible();
};

const loginAsAdmin = async (page: Page, mockApi: MockApiController) => {
  mockApi.useScenario("auth.login.success", "auth.session.valid", "analytics.dashboard.success");

  await page.goto(LOGIN_PATH, GOTO_OPTIONS);
  await page.getByTestId("login-email").fill("admin@example.com");
  await page.getByTestId("login-password").fill("Secret123!");
  await page.getByTestId("login-submit").click();

  await expect(page).not.toHaveURL(/\/login$/);
  await expect(page.getByTestId("sidebar-link-users")).toBeVisible();
};

const openAddUserDirectly = async (page: Page, mockApi: MockApiController) => {
  await loginAsAdmin(page, mockApi);
  mockApi.useScenario("auth.session.valid", "analytics.dashboard.success");

  await page.goto(ADD_USER_PATH, GOTO_OPTIONS);
  await expectAddUserPage(page);
};

const openAddUserFromUsersList = async (page: Page, mockApi: MockApiController) => {
  await loginAsAdmin(page, mockApi);
  mockApi.useScenario("auth.session.valid", "analytics.dashboard.success", "users.success");

  await page.goto(USERS_PATH, GOTO_OPTIONS);
  await expect(page.getByTestId("users-table")).toBeVisible();
  await page.getByTestId("users-add-button").click();

  await expectAddUserPage(page);
};

const openSelectFirstOption = async (page: Page, triggerTestId: string) => {
  await page.getByTestId(triggerTestId).click();
  await page.getByRole("option").first().click();
};

const fillRequiredFields = async (
  page: Page,
  overrides: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
  } = {}
) => {
  await page.getByTestId("user-form-first-name").fill(overrides.firstName ?? "New");
  await page.getByTestId("user-form-last-name").fill(overrides.lastName ?? "User");
  await page.getByTestId("user-form-phone").fill(overrides.phone ?? "0501234567");
  await page.getByTestId("user-form-email").fill(overrides.email ?? "MixedCase@Example.COM");

  await openSelectFirstOption(page, "user-form-plan-type");
  await openSelectFirstOption(page, "user-form-remind-in");

  await page.getByTestId("user-form-date-finished").click();
  await openSelectFirstOption(page, "user-form-date-preset");
};

const submitForm = async (page: Page) => {
  await page.getByTestId("user-form-submit").click();
};

const expectCreateUserRequest = async (requests: Request[]) => {
  await expect.poll(() => requests.length).toBe(1);
  return requests[0];
};

test.describe("add user page routing and entry", () => {
  let mockApi: MockApiController;

  test.beforeEach(async ({ page }) => {
    mockApi = await installMockApi(page);
  });

  test("redirects unauthenticated visitors to login", async ({ page }) => {
    await page.goto(ADD_USER_PATH, GOTO_OPTIONS);

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-page")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("loads the add-user form on direct authenticated navigation", async ({ page }) => {
    await openAddUserDirectly(page, mockApi);

    await expect(page.getByTestId("user-form-first-name")).toBeVisible();
    await expect(page.getByTestId("back-button")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("navigates to the add-user page from the users list", async ({ page }) => {
    await openAddUserFromUsersList(page, mockApi);
    mockApi.assertNoUnhandledRequests();
  });

  test("supports browser back and forward after opening the add-user page from the list", async ({
    page,
  }) => {
    await openAddUserFromUsersList(page, mockApi);

    await page.goBack();
    await expect.poll(() => normalizePathname(new URL(page.url()).pathname)).toBe(USERS_PATH);
    await expect(page.getByTestId("users-table")).toBeVisible();

    await page.goForward();
    await expectAddUserPage(page);
    mockApi.assertNoUnhandledRequests();
  });

  test("uses the in-page back button to return to the users list", async ({ page }) => {
    await openAddUserFromUsersList(page, mockApi);

    await page.getByTestId("back-button").click();

    await expect.poll(() => normalizePathname(new URL(page.url()).pathname)).toBe(USERS_PATH);
    await expect(page.getByTestId("users-table")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });
});

test.describe("add user page data states", () => {
  let mockApi: MockApiController;

  test.beforeEach(async ({ page }) => {
    mockApi = await installMockApi(page);
    await openAddUserDirectly(page, mockApi);
  });

  test("submits successfully and navigates to the created user dashboard", async ({ page }) => {
    const createRequests = trackRequests(page, "POST", "/users");

    mockApi.useScenario(
      "auth.session.valid",
      "users.create.success",
      "users.one.success",
      "weigh-ins.user.empty",
      "users.delete.precheck.empty"
    );

    await fillRequiredFields(page);
    await submitForm(page);

    const createRequest = await expectCreateUserRequest(createRequests);
    const body = createRequest.postDataJSON() as Record<string, unknown>;

    expect(body.email).toBe("mixedcase@example.com");
    expect(body.remindIn).toBe(604800);
    expect(typeof body.checkInAt).toBe("number");

    await expect(page).toHaveURL(/\/users\/user-created-001\?tab=/);
    await expect(page.getByTestId("user-dashboard")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("falls back to the users list when create succeeds without an id", async ({ page }) => {
    const createRequests = trackRequests(page, "POST", "/users");

    mockApi.useScenario("auth.session.valid", "users.create.empty", "users.success");

    await fillRequiredFields(page, { email: "empty@example.com" });
    await submitForm(page);

    await expectCreateUserRequest(createRequests);
    await expect.poll(() => normalizePathname(new URL(page.url()).pathname)).toBe(USERS_PATH);
    await expect(page.getByTestId("users-table")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  for (const scenario of [
    "users.create.error-400",
    "users.create.error-401",
    "users.create.error-403",
    "users.create.error-404",
    "users.create.error-500",
  ] as const) {
    test(`stays on the form when the create request returns ${scenario}`, async ({ page }) => {
      const createRequests = trackRequests(page, "POST", "/users");

      mockApi.useScenario("auth.session.valid", scenario);

      await fillRequiredFields(page, { email: `${scenario}@example.com` });
      await submitForm(page);

      await expectCreateUserRequest(createRequests);
      await expectAddUserPage(page);
      await expect(page.getByTestId("user-form-submit")).toBeEnabled();
      mockApi.assertNoUnhandledRequests();
    });
  }

  test("stays on the form when the create request fails at the network layer", async ({ page }) => {
    const createRequests = trackRequests(page, "POST", "/users");

    mockApi.useScenario("auth.session.valid", "users.create.network-failure");

    await fillRequiredFields(page, { email: "network@example.com" });
    await submitForm(page);

    await expectCreateUserRequest(createRequests);
    await expectAddUserPage(page);
    await expect(page.getByTestId("user-form-submit")).toBeEnabled();
    mockApi.assertNoUnhandledRequests();
  });

  test("shows a loading state while the create request is delayed", async ({ page }) => {
    const createRequests = trackRequests(page, "POST", "/users");

    mockApi.useScenario(
      "auth.session.valid",
      { key: "users.create.success", overrides: { delayMs: 800 } },
      "users.one.success",
      "weigh-ins.user.empty",
      "users.delete.precheck.empty"
    );

    await fillRequiredFields(page, { email: "slow@example.com" });
    await submitForm(page);

    await expect(page.getByTestId("user-form-submit")).toBeDisabled();
    await expect(page.getByTestId("loader")).toBeVisible();
    await expectCreateUserRequest(createRequests);
    await expect(page.getByTestId("user-dashboard")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });
});

test.describe("add user page interactions", () => {
  let mockApi: MockApiController;

  test.beforeEach(async ({ page }) => {
    mockApi = await installMockApi(page);
    await openAddUserDirectly(page, mockApi);
  });

  test("shows validation errors and blocks submit when required fields are missing", async ({
    page,
  }) => {
    const createRequests = trackRequests(page, "POST", "/users");

    await submitForm(page);

    await expect(page.getByTestId("user-form-first-name-error")).toBeVisible();
    await expect(page.getByTestId("user-form-last-name-error")).toBeVisible();
    await expect(page.getByTestId("user-form-phone-error")).toBeVisible();
    await expect(page.getByTestId("user-form-email-error")).toBeVisible();
    await expect(page.getByTestId("user-form-plan-type-error")).toBeVisible();
    await expect(page.getByTestId("user-form-date-finished-error")).toBeVisible();
    expect(createRequests).toHaveLength(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("shows field errors for invalid phone and email values", async ({ page }) => {
    const createRequests = trackRequests(page, "POST", "/users");

    await fillRequiredFields(page, {
      phone: "123",
      email: "not-an-email",
    });
    await submitForm(page);

    await expect(page.getByTestId("user-form-phone-error")).toBeVisible();
    await expect(page.getByTestId("user-form-email-error")).toBeVisible();
    expect(createRequests).toHaveLength(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("prevents duplicate submissions while the create request is pending", async ({ page }) => {
    const createRequests = trackRequests(page, "POST", "/users");

    mockApi.useScenario(
      "auth.session.valid",
      { key: "users.create.success", overrides: { delayMs: 900 } },
      "users.one.success",
      "weigh-ins.user.empty",
      "users.delete.precheck.empty"
    );

    await fillRequiredFields(page, { email: "pending@example.com" });

    const submitButton = page.getByTestId("user-form-submit");
    await submitButton.click();
    await expect(submitButton).toBeDisabled();
    await page.keyboard.press("Enter");

    await expectCreateUserRequest(createRequests);
    await expect.poll(() => createRequests.length).toBe(1);
    await expect(page.getByTestId("user-dashboard")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });
});
