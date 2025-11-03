import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { TID } from '../helpers/ids';

export class UsersPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/users');
  }

  async openAddUser() {
    await this.page.getByTestId('nav-users-add-link').click();
  }

  async search(term: string) {
    await this.page.getByTestId(TID.search).fill(term);
  }

  async openRowActions(id: string) {
    await this.page.getByTestId(`row-${id}-actions`).click();
  }

  async openRow(id: string) {
    await this.row(id).dblclick();
  }

  async toggleAccess(id: string) {
    await this.page.getByTestId(`toggle-access-${id}`).click();
  }

  async expectRow(id: string) {
    await expect(this.row(id)).toBeVisible();
  }
}
