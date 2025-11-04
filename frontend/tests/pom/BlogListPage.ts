import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { TID } from '../helpers/ids';

export class BlogListPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/blogs');
  }

  async openCreate() {
    await this.page.getByTestId('nav-blogs-create-link').click();
  }

  async filterByGroup(name: string) {
    await this.page.getByTestId('filter-lesson-groups').click();
    await this.page.getByRole('menuitemcheckbox', { name }).click();
  }

  async expectBlogCard(id: string) {
    await expect(this.page.getByTestId(TID.row(id))).toBeVisible();
  }
}
