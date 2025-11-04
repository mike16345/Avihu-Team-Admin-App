import { expect, Page } from '@playwright/test';
import { TID } from '../helpers/ids';
import { expectEmptyState, expectRows as expectRowCount, waitForLoading } from '../helpers/assertions';

export class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path: string) {
    await this.page.goto(path);
    await this.waitReady();
  }

  async waitReady() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
    await waitForLoading(this.page);
  }

  table() {
    return this.page.getByTestId(TID.rows);
  }

  row(id: string) {
    return this.page.getByTestId(TID.row(id));
  }

  async expectEmpty() {
    await expectEmptyState(this.page);
  }

  async expectRows(count?: number) {
    await expectRowCount(this.page, count);
  }

  async expectToastSuccess() {
    await expect(this.page.getByTestId(TID.toastSuccess)).toBeVisible();
  }
}
