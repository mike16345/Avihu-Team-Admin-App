import { expect, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { ids } from '../helpers/ids';

export class EntitiesPage extends BasePage {
  readonly createButton = this.page.getByTestId(ids.createButton);
  readonly tableRows = this.page.getByTestId(ids.tableRows);
  readonly emptyState = this.page.getByTestId(ids.emptyState);
  readonly successToast = this.page.getByTestId(ids.toastSuccess);
  readonly errorAlert = this.page.getByTestId(ids.alertError);

  constructor(page: Page) {
    super(page);
  }

  navLink(route: string) {
    return this.page.getByTestId(ids.navLink(route));
  }

  row(id: string) {
    return this.page.getByTestId(ids.row(id));
  }

  rowEdit(id: string) {
    return this.page.getByTestId(ids.rowEdit(id));
  }

  rowDelete(id: string) {
    return this.page.getByTestId(ids.rowDelete(id));
  }

  formField(name: string) {
    return this.page.getByTestId(ids.formField(name));
  }

  get formSubmit() {
    return this.page.getByTestId(ids.formSubmit);
  }

  async gotoList() {
    await this.page.goto('/users');
    await this.waitForReady();
  }

  async openCreateForm() {
    await this.createButton.click();
    await this.page.waitForURL('**/users/add');
    await this.waitForReady();
  }

  async waitForListLoaded() {
    await this.waitForReady();
    const hasRows = await this.tableRows.isVisible().catch(() => false);
    const hasEmptyState = await this.emptyState.isVisible().catch(() => false);
    expect(hasRows || hasEmptyState).toBeTruthy();
  }

  async fillUserForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    planType: string;
    remindIn: string;
  }) {
    await this.formField('firstName').fill(data.firstName);
    await this.formField('lastName').fill(data.lastName);
    await this.formField('email').fill(data.email);
    await this.formField('phone').fill(data.phone);

    await this.formField('planType').click();
    await this.page.getByRole('option', { name: data.planType }).click();

    await this.formField('remindIn').click();
    await this.page.getByRole('option', { name: data.remindIn }).click();
  }

  async submitFormExpectSuccess() {
    await expect(this.formSubmit).toBeEnabled();
    await this.formSubmit.click();
    await this.expectToast(this.successToast);
  }

  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    planType: string;
    remindIn: string;
  }) {
    await this.fillUserForm(data);
    await this.submitFormExpectSuccess();
  }

  async expectRowPresent(id: string) {
    await expect(this.tableRows).toBeVisible();
    await expect(this.row(id)).toBeVisible();
  }
}
