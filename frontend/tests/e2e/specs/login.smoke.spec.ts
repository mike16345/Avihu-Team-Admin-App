import { expect, test } from "@playwright/test";
import { useMockApi } from "../utils/mockApi";

const USERS_LOGIN_PATH_SUFFIX = "/users/user/login";

test("renders the login smoke shell", async ({ page }) => {
  const mockApi = await useMockApi(page, []);

  await page.goto("/login");

  await expect(page.getByTestId("login-page")).toBeVisible();
  await expect(page.getByTestId("login-email")).toBeVisible();
  await expect(page.getByTestId("login-password")).toBeVisible();
  await expect(page.getByTestId("login-submit")).toBeVisible();
  
  mockApi.assertNoUnhandledRequests();
});

test("uses the unauthorized login scenario via request interception", async ({ page }) => {
  const mockApi = await useMockApi(page, ["auth.login.unauthorized"]);

  await page.goto("/login");

  const responsePromise = page.waitForResponse((response) => {
    const responseUrl = new URL(response.url());

    return (
      response.request().method() === "POST" &&
      responseUrl.pathname.endsWith(USERS_LOGIN_PATH_SUFFIX)
    );
  });

  await page.getByTestId("login-email").fill("admin@example.com");
  await page.getByTestId("login-password").fill("wrong-password");
  await page.getByTestId("login-submit").click();

  const response = await responsePromise;

  expect(response.status()).toBe(401);
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByTestId("login-page")).toBeVisible();
  mockApi.assertNoUnhandledRequests();
});
