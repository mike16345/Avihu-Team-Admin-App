/**
 * CRUD workflows for users, ensuring create/update/delete flows behave under mock APIs.
 */
import { expect, Page, test } from '@playwright/test';
import { useAuthenticated } from '../helpers/auth';
import { interceptJSON } from '../helpers/network';
import {
  usersListResponse,
  createUserResponse,
  userDetailResponse,
  updateUserResponse,
  deleteUserResponse,
} from '../fixtures/users';
import { UserFormPage } from '../pom/UserFormPage';
import { UsersPage } from '../pom/UsersPage';
import { API_MODE, ALLOW_LIVE_DELETE } from '../helpers/env';

let createdUserId: string | undefined;

const emptyWeighIns = { data: [], message: 'ok' };

async function mockUserDashboard(page:Page, userId: string, detail = createUserResponse) {
  await interceptJSON(page, 'GET', `/users/one?id=${userId}`, {
    data: { ...detail.data, _id: userId },
    message: detail.message,
  });
  await interceptJSON(page, 'GET', new RegExp(`/weighIns/weights/user\\?id=${userId}`), emptyWeighIns);
  await interceptJSON(page, 'GET', new RegExp(`/recordedSets/user\\?userId=${userId}`), { data: [], message: 'ok' });
  await interceptJSON(page, 'GET', new RegExp(`/measurements/one\\?userId=${userId}`), {
    data: { userId, measurements: [] },
    message: 'ok',
  });
  await interceptJSON(page, 'GET', new RegExp(`/userImageUrls/user\\?userId=${userId}`), { data: [], message: 'ok' });
}

useAuthenticated(test);

test.describe('User CRUD', () => {
  test('create user → success', async ({ page }) => {
    await interceptJSON(page, 'POST', '/users', createUserResponse);
    await mockUserDashboard(page, 'user-3', createUserResponse);

    const form = new UserFormPage(page);
    await form.gotoCreate();
    await form.fillForm({
      firstName: 'Yael',
      lastName: 'Bar',
      email: 'yael@example.com',
      phone: '0533333333',
      planType: 'מסה',
      remindIn: 'שבוע',
      dietaryTypes: ['צמחוני'],
    });
    await form.submit();
    await page.waitForURL(/\/users\/user-3/);
    createdUserId = 'user-3';
  });

  test('update user → success', async ({ page }) => {
    await interceptJSON(page, 'GET', '/users/one?id=user-1', userDetailResponse);
    await interceptJSON(page, 'PUT', '/users/one?id=user-1', updateUserResponse);
    await mockUserDashboard(page, 'user-1', updateUserResponse);

    const form = new UserFormPage(page);
    await form.goto('/users/edit/user-1');
    await form.fillForm({
      firstName: 'Dana',
      lastName: 'Levi',
      email: 'dana@example.com',
      phone: '0501234567',
      planType: 'מסה',
      remindIn: 'שבוע',
    });
    await form.submit();
    await page.waitForURL(/\/users\/user-1/);
  });

  test('delete created user (only if created)', async ({ page }) => {
    test.skip(!createdUserId, 'Skipping delete because user was not created in this run.');
    test.skip(API_MODE === 'live' && !ALLOW_LIVE_DELETE, 'Live delete disabled.');

    await interceptJSON(page, 'GET', '/users', {
      data: [...usersListResponse.data, { ...createUserResponse.data, _id: createdUserId }],
      message: 'ok',
    });
    await interceptJSON(page, 'GET', new RegExp(`/userImageUrls/user\\?userId=${createdUserId}`), { data: [], message: 'ok' });
    await interceptJSON(page, 'DELETE', new RegExp(`/users/one\\?id=${createdUserId}`), deleteUserResponse);

    const users = new UsersPage(page);
    await users.goto();
    await users.expectRow(createdUserId!);
    await page.getByTestId(`row-${createdUserId}-actions`).click();
    await page.getByTestId(`row-${createdUserId}-delete`).click();
    await page.getByTestId('dialog-confirm').click();
    await expect(page.getByTestId(`row-${createdUserId}`)).toHaveCount(0);
  });
});
