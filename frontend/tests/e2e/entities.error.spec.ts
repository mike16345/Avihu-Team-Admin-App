import { test, expect } from '@playwright/test';
import { EntitiesPage } from '../page-objects/EntitiesPage';
import { mockCreateUserFailure, seedUsers, usersFixtures, withLogin } from '../fixtures/entities';
import { isLiveMode } from '../helpers/env';

test.describe('Users table: create error handling', () => {
  test.beforeEach(async ({ page }) => {
    if (!isLiveMode) {
      await seedUsers(page, usersFixtures.multiple);
      await mockCreateUserFailure(page);
    }
    await withLogin(page);
  });

  test.skip(isLiveMode, 'Live mode error path is validated via mock execution.');

  test('surface error toast and keep form interactive when server fails', async ({ page }) => {
    const entitiesPage = new EntitiesPage(page);
    await entitiesPage.gotoList();
    await entitiesPage.waitForListLoaded();
    await entitiesPage.openCreateForm();
    await entitiesPage.fillUserForm({
      firstName: 'Error',
      lastName: 'Case',
      email: 'error@example.com',
      phone: '+972500000099',
      planType: 'מסה',
      remindIn: 'שבוע',
    });

    await expect(entitiesPage.formSubmit).toBeEnabled();
    await entitiesPage.formSubmit.click();

    await expect(entitiesPage.errorAlert).toBeVisible();
    await expect(entitiesPage.formSubmit).toBeEnabled();

    await entitiesPage.gotoList();
    await entitiesPage.waitForListLoaded();
    await expect(page.getByTestId('row-user-new')).toHaveCount(0);
  });
});
