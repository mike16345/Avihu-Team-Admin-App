import { expect, type Page, type Request, test } from "@playwright/test";
import { useMockApi } from "../utils/mockApi";

const LOGIN_PATH = "/login";
const LOGIN_PATH_SUFFIX = "/users/auth/login";
const REFRESH_PATH_SUFFIX = "/users/auth/refresh";

const getEmailInput = (page: Page) => page.getByTestId("login-email");
const getPasswordInput = (page: Page) => page.getByTestId("login-password");
const getSubmitButton = (page: Page) => page.getByTestId("login-submit");
const getForgotPasswordTrigger = (page: Page) => page.getByTestId("forgot-password-trigger");

test.setTimeout(60_000);

const trackLoginRequests = (page: Page) => {
  const requests: Request[] = [];

  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname.endsWith(LOGIN_PATH_SUFFIX)) {
      requests.push(request);
    }
  });

  return requests;
};

const trackRequestsByPathSuffix = (page: Page, pathSuffix: string, method?: string) => {
  const requests: Request[] = [];

  page.on("request", (request) => {
    const matchesMethod = !method || request.method() === method;

    if (matchesMethod && new URL(request.url()).pathname.endsWith(pathSuffix)) {
      requests.push(request);
    }
  });

  return requests;
};

const submitLoginForm = async (page: Page) => {
  await getSubmitButton(page).click();
};

test.describe("login page", () => {
  test("renders the login shell", async ({ page }) => {
    const mockApi = await useMockApi(page, []);

    await page.goto(LOGIN_PATH);

    await expect(page.getByTestId("login-page")).toBeVisible();
    await expect(getEmailInput(page)).toBeVisible();
    await expect(getPasswordInput(page)).toBeVisible();
    await expect(getSubmitButton(page)).toBeVisible();
    await expect(getForgotPasswordTrigger(page)).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("completes the forgot password flow inline", async ({ page }) => {
    const mockApi = await useMockApi(page, [
      "auth.password-reset.request.success",
      "auth.password-reset.validate.success",
      "auth.password-reset.change.success",
    ]);
    const otpRequests = trackRequestsByPathSuffix(page, "/otp", "POST");
    const otpValidationRequests = trackRequestsByPathSuffix(page, "/otp/validate", "POST");
    const passwordChangeRequests = trackRequestsByPathSuffix(page, "/passwords", "PUT");

    await page.goto(LOGIN_PATH);
    await getForgotPasswordTrigger(page).click();

    await page.getByTestId("forgot-password-email").fill(" Admin@Example.com ");
    await page.getByTestId("forgot-password-send-otp").click();

    await expect(page.getByTestId("forgot-password-otp")).toBeVisible();
    await page.getByTestId("forgot-password-otp").fill("123456");
    await page.getByTestId("forgot-password-verify-otp").click();

    await expect(page.getByTestId("forgot-password-password")).toBeVisible();
    await page.getByTestId("forgot-password-password").fill("NewSecret123!");
    await page.getByTestId("forgot-password-confirm-password").fill("NewSecret123!");
    await page.getByTestId("forgot-password-submit").click();

    await expect(page.getByText("הסיסמה עודכנה בהצלחה.")).toBeVisible();
    await expect(getSubmitButton(page)).toBeVisible();

    expect(otpRequests).toHaveLength(1);
    expect(otpValidationRequests).toHaveLength(1);
    expect(passwordChangeRequests).toHaveLength(1);
    expect(otpRequests[0].headers()["x-api-key"]).toBeTruthy();
    expect(otpValidationRequests[0].headers()["x-api-key"]).toBeTruthy();
    expect(passwordChangeRequests[0].headers()["x-api-key"]).toBeTruthy();
    expect(otpRequests[0].postDataJSON()).toEqual({ email: "admin@example.com" });
    expect(otpValidationRequests[0].postDataJSON()).toEqual({
      email: "admin@example.com",
      otp: "123456",
    });
    expect(passwordChangeRequests[0].postDataJSON()).toEqual({
      email: "admin@example.com",
      password: "NewSecret123!",
      sessionId: "change-password-session-001",
    });
    mockApi.assertNoUnhandledRequests();
  });

  test("returns to the otp step when the reset code expires before password update", async ({
    page,
  }) => {
    const mockApi = await useMockApi(page, [
      "auth.password-reset.request.success",
      "auth.password-reset.validate.success",
      "auth.password-reset.change.expired",
    ]);

    await page.goto(LOGIN_PATH);
    await getForgotPasswordTrigger(page).click();

    await page.getByTestId("forgot-password-email").fill("admin@example.com");
    await page.getByTestId("forgot-password-send-otp").click();
    await page.getByTestId("forgot-password-otp").fill("123456");
    await page.getByTestId("forgot-password-verify-otp").click();

    await expect(page.getByTestId("forgot-password-password")).toBeVisible();
    await page.getByTestId("forgot-password-password").fill("NewSecret123!");
    await page.getByTestId("forgot-password-confirm-password").fill("NewSecret123!");
    await page.getByTestId("forgot-password-submit").click();

    await expect(page.getByTestId("forgot-password-otp")).toBeVisible();
    await expect(page.getByTestId("forgot-password-password")).not.toBeVisible();
    await expect(page.getByText("תוקף קוד האימות פג. שלחו קוד חדש כדי להמשיך.")).toBeVisible();
    await expect(page.getByText("תוקף הקוד פג. שלחו קוד חדש והזינו אותו שוב.")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("blocks submit when both fields are empty", async ({ page }) => {
    const mockApi = await useMockApi(page, []);
    const loginRequests = trackLoginRequests(page);

    await page.goto(LOGIN_PATH);
    await submitLoginForm(page);

    await expect(page).toHaveURL(/\/login$/);
    await expect(getEmailInput(page)).toBeFocused();
    expect(await getEmailInput(page).evaluate((node) => (node as HTMLInputElement).validity.valueMissing)).toBe(true);
    expect(await getPasswordInput(page).evaluate((node) => (node as HTMLInputElement).validity.valueMissing)).toBe(true);
    expect(loginRequests).toHaveLength(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("blocks submit when only the email is filled", async ({ page }) => {
    const mockApi = await useMockApi(page, []);
    const loginRequests = trackLoginRequests(page);

    await page.goto(LOGIN_PATH);
    await getEmailInput(page).fill("admin@example.com");
    await submitLoginForm(page);

    await expect(page).toHaveURL(/\/login$/);
    await expect(getPasswordInput(page)).toBeFocused();
    expect(await getPasswordInput(page).evaluate((node) => (node as HTMLInputElement).validity.valueMissing)).toBe(true);
    expect(loginRequests).toHaveLength(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("blocks submit when only the password is filled", async ({ page }) => {
    const mockApi = await useMockApi(page, []);
    const loginRequests = trackLoginRequests(page);

    await page.goto(LOGIN_PATH);
    await getPasswordInput(page).fill("Secret123!");
    await submitLoginForm(page);

    await expect(page).toHaveURL(/\/login$/);
    await expect(getEmailInput(page)).toBeFocused();
    expect(await getEmailInput(page).evaluate((node) => (node as HTMLInputElement).validity.valueMissing)).toBe(true);
    expect(loginRequests).toHaveLength(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("blocks submit when the email format is invalid", async ({ page }) => {
    const mockApi = await useMockApi(page, []);
    const loginRequests = trackLoginRequests(page);

    await page.goto(LOGIN_PATH);
    await getEmailInput(page).fill("not-an-email");
    await getPasswordInput(page).fill("Secret123!");
    await submitLoginForm(page);

    await expect(page).toHaveURL(/\/login$/);
    await expect(getEmailInput(page)).toBeFocused();
    expect(await getEmailInput(page).evaluate((node) => (node as HTMLInputElement).validity.typeMismatch)).toBe(true);
    expect(loginRequests).toHaveLength(0);
    mockApi.assertNoUnhandledRequests();
  });

  test("shows an error and stays on login for unauthorized credentials", async ({ page }) => {
    const mockApi = await useMockApi(page, ["auth.login.unauthorized"]);
    const loginRequests = trackLoginRequests(page);

    await page.goto(LOGIN_PATH);
    await getEmailInput(page).fill("admin@example.com");
    await getPasswordInput(page).fill("wrong-password");
    await submitLoginForm(page);

    await expect(page.getByText("אימייל או סיסמה שגויים")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
    expect(loginRequests).toHaveLength(1);
    expect(loginRequests[0].headers()["x-api-key"]).toBeTruthy();
    mockApi.assertNoUnhandledRequests();
  });

  test("navigates to the admin dashboard for valid credentials", async ({ page }) => {
    const mockApi = await useMockApi(page, ["auth.login.success", "analytics.dashboard.success"]);
    const loginRequests = trackLoginRequests(page);
    const analyticsRequests = trackRequestsByPathSuffix(page, "/analytics/users", "GET");

    await page.goto(LOGIN_PATH);
    await getEmailInput(page).fill("admin@example.com");
    await getPasswordInput(page).fill("Secret123!");
    await submitLoginForm(page);

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("admin-dashboard")).toBeVisible();
    expect(loginRequests).toHaveLength(1);
    expect(loginRequests[0].headers()["x-api-key"]).toBeTruthy();
    expect(analyticsRequests.length).toBeGreaterThan(0);
    expect(
      analyticsRequests.every(
        (request) => request.headers().authorization === "Bearer mock-access-token"
      )
    ).toBe(true);
    expect(analyticsRequests.every((request) => request.headers()["x-api-key"])).toBe(true);
    mockApi.assertNoUnhandledRequests();
  });

  test("restores the session from a persisted refresh token on reload", async ({ page }) => {
    const mockApi = await useMockApi(page, ["auth.login.success", "analytics.dashboard.success"]);
    const refreshRequests = trackRequestsByPathSuffix(page, REFRESH_PATH_SUFFIX, "POST");

    await page.goto(LOGIN_PATH);
    await getEmailInput(page).fill("admin@example.com");
    await getPasswordInput(page).fill("Secret123!");
    await submitLoginForm(page);
    await expect(page.getByTestId("admin-dashboard")).toBeVisible();

    mockApi.useScenario("auth.refresh.success", "analytics.dashboard.success");
    await page.reload();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("admin-dashboard")).toBeVisible();
    expect(refreshRequests).toHaveLength(1);
    expect(refreshRequests[0].headers()["x-api-key"]).toBeTruthy();
    mockApi.assertNoUnhandledRequests();
  });

  test("clears auth state when persisted refresh fails", async ({ page }) => {
    const mockApi = await useMockApi(page, ["auth.login.success", "analytics.dashboard.success"]);

    await page.goto(LOGIN_PATH);
    await getEmailInput(page).fill("admin@example.com");
    await getPasswordInput(page).fill("Secret123!");
    await submitLoginForm(page);
    await expect(page.getByTestId("admin-dashboard")).toBeVisible();

    mockApi.useScenario("auth.refresh.unauthorized", "analytics.dashboard.success");
    await page.reload();

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByTestId("login-page")).toBeVisible();
    mockApi.assertNoUnhandledRequests();
  });

  test("refreshes once and retries a protected request after 401", async ({ page }) => {
    const mockApi = await useMockApi(page, [
      "auth.login.success",
      "auth.refresh.success",
      "analytics.dashboard.users.unauthorized",
    ]);
    const refreshRequests = trackRequestsByPathSuffix(page, REFRESH_PATH_SUFFIX, "POST");
    const analyticsUsersRequests = trackRequestsByPathSuffix(page, "/analytics/users", "GET");

    await page.goto(LOGIN_PATH);
    await getEmailInput(page).fill("admin@example.com");
    await getPasswordInput(page).fill("Secret123!");
    await submitLoginForm(page);

    await expect.poll(() => refreshRequests.length).toBe(1);
    await expect
      .poll(() =>
        analyticsUsersRequests.some(
          (request) => request.headers().authorization === "Bearer mock-refreshed-access-token"
        )
      )
      .toBe(true);
    mockApi.assertNoUnhandledRequests();
  });
});
