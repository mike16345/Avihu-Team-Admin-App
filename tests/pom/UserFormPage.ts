import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { TID } from '../helpers/ids';

type UserFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  planType: string;
  remindIn: string;
  dietaryTypes?: string[];
};

export class UserFormPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoCreate() {
    await super.goto('/users/add');
  }

  async fillForm(data: UserFormData) {
    await this.page.getByTestId(TID.form.field('firstName')).fill(data.firstName);
    await this.page.getByTestId(TID.form.field('lastName')).fill(data.lastName);
    await this.page.getByTestId(TID.form.field('email')).fill(data.email);
    await this.page.getByTestId(TID.form.field('phone')).fill(data.phone);

    await this.page.getByTestId(TID.form.field('planType')).click();
    await this.page.getByRole('option', { name: data.planType }).click();

    await this.page.getByTestId(TID.form.field('remindIn')).click();
    await this.page.getByRole('option', { name: data.remindIn }).click();

    if (data.dietaryTypes?.length) {
      await this.page.getByTestId('toggle-dietary-type').click();
      for (const item of data.dietaryTypes) {
        const normalized = item.replace(/\s+/g, '-');
        await this.page.getByTestId(`toggle-dietary-${normalized}`).click();
      }
    }
  }

  async submit() {
    await this.page.getByTestId(TID.form.submit).click();
  }

  async expectValidation(field: string) {
    await expect(this.page.getByTestId(TID.form.error(field))).toBeVisible();
  }
}
