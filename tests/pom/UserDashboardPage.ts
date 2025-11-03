import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class UserDashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto(id: string) {
    await super.goto(`/users/${id}`);
  }

  async switchTab(name: 'weight' | 'workout' | 'measurement') {
    await this.page.getByTestId(`tab-${name}`).click();
  }

  async expectTabVisible(name: 'weight' | 'workout' | 'measurement') {
    await expect(this.page.getByTestId(`tab-${name}`)).toBeVisible();
  }
}
