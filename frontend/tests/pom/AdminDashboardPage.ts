import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { TID } from '../helpers/ids';

export class AdminDashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/');
  }

  async expectShortcuts() {
    await expect(this.page.getByTestId(TID.nav('users-add'))).toBeVisible();
    await expect(this.page.getByTestId(TID.nav('presets-dietPlans'))).toBeVisible();
  }

  async advanceCarousel() {
    await this.page.getByTestId('carousel-next').click();
  }
}
