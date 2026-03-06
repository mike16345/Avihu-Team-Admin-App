import { expect, type Page } from "@playwright/test";

const LOGIN_PATH = "/login";
const GOTO_OPTIONS = { waitUntil: "domcontentloaded" } as const;
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "Secret123!";

export const loginAsAdmin = async (page: Page) => {
  await page.goto(LOGIN_PATH, GOTO_OPTIONS);
  await expect(page.getByTestId("login-page")).toBeVisible();
  await page.getByTestId("login-email").fill(ADMIN_EMAIL);
  await page.getByTestId("login-password").fill(ADMIN_PASSWORD);
  await page.getByTestId("login-submit").click();
};
