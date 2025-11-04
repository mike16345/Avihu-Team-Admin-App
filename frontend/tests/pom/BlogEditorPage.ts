import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { TID } from '../helpers/ids';

export type BlogFormData = {
  title: string;
  planType: string;
  group: string;
  content: string;
  mediaType?: 'link' | 'image';
  link?: string;
};

export class BlogEditorPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async gotoCreate() {
    await super.goto('/blogs/create');
  }

  async fillForm(data: BlogFormData) {
    await this.page.getByTestId(TID.form.field('title')).fill(data.title);

    const planTrigger = this.page.getByTestId('form-field-planType').getByRole('combobox');
    await planTrigger.click();
    await this.page.getByRole('option', { name: data.planType }).click();

    const groupTrigger = this.page.getByTestId('form-field-group').getByRole('combobox');
    await groupTrigger.click();
    await this.page.getByRole('option', { name: data.group }).click();

    if (data.mediaType === 'image') {
      await this.page.getByTestId('radio-image').click();
    } else {
      await this.page.getByTestId('radio-link').click();
      if (data.link) {
        await this.page.getByTestId(TID.form.field('link')).fill(data.link);
      }
    }

    await this.page.locator('#editor .ql-editor').fill(data.content);
  }

  async submit() {
    await this.page.getByTestId(TID.form.submit).click();
  }
}
