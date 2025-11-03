import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { TID } from '../helpers/ids';

export class AuthPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/login');
  }

  async signIn(email: string, password: string) {
    await this.page.getByTestId(TID.form.field('email')).fill(email);
    await this.page.getByTestId(TID.form.field('password')).fill(password);
    await this.page.getByTestId(TID.form.submit).click();
  }

  async expectSignedIn() {
    await expect(this.page.getByTestId(TID.nav('home'))).toBeVisible();
  }

  async expectInvalidCredentials() {
    await expect(this.page.getByTestId(TID.form.error('email'))).toBeVisible();
  }
}
