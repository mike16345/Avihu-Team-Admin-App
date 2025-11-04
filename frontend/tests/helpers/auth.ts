import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import type { Browser, Page, TestType } from '@playwright/test';
import { STORAGE_STATE, E2E_USER, E2E_PASS, requireEnv, API_MODE } from './env';
import { AuthPage } from '../pom/AuthPage';
import { interceptJSON } from './network';
import { loginSuccessResponse } from '../fixtures/auth';

async function performLogin(browser: Browser) {
  const context = await browser.newContext();
  const page = await context.newPage();

  if (API_MODE === 'mock') {
    await interceptJSON(page, 'POST', '/users/user/login', loginSuccessResponse);
    await interceptJSON(page, 'POST', '/users/user/session', { data: { isValid: true }, message: 'ok' });
  }

  const auth = new AuthPage(page);
  await auth.goto();
  await auth.signIn(requireEnv(E2E_USER, 'E2E_TEST_USER'), requireEnv(E2E_PASS, 'E2E_TEST_PASS'));
  await auth.expectSignedIn();

  await context.storageState({ path: STORAGE_STATE });
  await context.close();
}

export async function ensureStorageState(browser: Browser) {
  if (!existsSync(STORAGE_STATE)) {
    await performLogin(browser);
    return;
  }

  if (API_MODE === 'mock') {
    await performLogin(browser);
  }
}

export function useAuthenticated(test: TestType<any, any>) {
  test.beforeAll(async ({ browser }) => {
    await ensureStorageState(browser);
  });

  test.use({ storageState: STORAGE_STATE });
}

export async function clearStorageState(page: Page) {
  if (existsSync(STORAGE_STATE)) {
    await fs.unlink(STORAGE_STATE);
  }
  await page.context().clearCookies();
}
