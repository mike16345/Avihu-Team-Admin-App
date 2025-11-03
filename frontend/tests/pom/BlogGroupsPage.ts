import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class BlogGroupsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/presets/blogs/groups');
  }

  async openCreate() {
    await this.page.getByTestId('tab-lessonGroups-add').click();
  }
}
