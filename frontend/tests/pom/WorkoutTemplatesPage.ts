import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class WorkoutTemplatesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/workoutPlans');
  }

  async switchTab(value: string) {
    await this.page.getByTestId(`tab-${value}`).click();
  }

  async openCreate(value: string) {
    await this.page.getByTestId(`tab-${value}-add`).click();
  }
}
