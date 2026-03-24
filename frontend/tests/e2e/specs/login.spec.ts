import { expect, type Page, type Request, test } from "@playwright/test";
import { useMockApi } from "../utils/mockApi";

const LOGIN_PATH = "/login";
const LOGIN_PATH_SUFFIX = "/users/user/login";

const getEmailInput = (page: Page) => page.getByTestId("login-email");
const getPasswordInput = (page: Page) => page.getByTestId("login-password");
const getSubmitButton = (page: Page) => page.getByTestId("login-submit");

const trackLoginRequests = (page: Page) => {
  const requests: Request[] = [];

  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname.endsWith(LOGIN_PATH_SUFFIX)) {
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
    mockApi.assertNoUnhandledRequests();
  });

  test("navigates to the admin dashboard for valid credentials", async ({ page }) => {
    const mockApi = await useMockApi(page, ["auth.login.success", "analytics.dashboard.success"]);
    const loginRequests = trackLoginRequests(page);

    await page.goto(LOGIN_PATH);
    await getEmailInput(page).fill("admin@example.com");
    await getPasswordInput(page).fill("Secret123!");
    await submitLoginForm(page);

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByTestId("admin-dashboard")).toBeVisible();
    expect(loginRequests).toHaveLength(1);
    mockApi.assertNoUnhandledRequests();
  });
});
