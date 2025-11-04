import { expect, Locator, Page } from '@playwright/test';
import { TID } from './ids';

export async function waitForLoading(page: Page) {
  const loader = page.getByTestId(TID.loading);
  if (await loader.count()) {
    await loader.first().waitFor({ state: 'hidden' });
  }
}

export async function expectToastThenDisappear(locator: Locator) {
  await expect(locator).toBeVisible();
  await locator.waitFor({ state: 'hidden' });
}

export async function expectAlert(page: Page, testId = TID.alertError) {
  const alert = page.getByTestId(testId);
  await expect(alert).toBeVisible();
}

export async function expectEmptyState(page: Page) {
  await expect(page.getByTestId(TID.empty)).toBeVisible();
}

export async function expectRows(page: Page, count?: number) {
  const rows = page.getByTestId(new RegExp(`^${TID.row('')}`));
  await expect(page.getByTestId(TID.rows)).toBeVisible();
  if (typeof count === 'number') {
    await expect(rows).toHaveCount(count);
  } else {
    await expect(rows).not.toHaveCount(0);
  }
}
