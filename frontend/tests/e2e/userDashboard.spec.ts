/**
 * User dashboard tab navigation and data fetch handling.
 */
import { test } from '@playwright/test';
import { UserDashboardPage } from '../pom/UserDashboardPage';
import { useAuthenticated } from '../helpers/auth';
import { interceptJSON } from '../helpers/network';
import { userDetailResponse } from '../fixtures/users';

useAuthenticated(test);

async function mockUserDashboard(page, userId: string) {
  await interceptJSON(page, 'GET', `/users/one?id=${userId}`, userDetailResponse);
  await interceptJSON(page, 'GET', new RegExp(`/weighIns/weights/user\\?id=${userId}`), { data: [], message: 'ok' });
  await interceptJSON(page, 'GET', new RegExp(`/recordedSets/user\\?userId=${userId}`), { data: [], message: 'ok' });
  await interceptJSON(page, 'GET', new RegExp(`/measurements/one\\?userId=${userId}`), {
    data: { userId, measurements: [] },
    message: 'ok',
  });
  await interceptJSON(page, 'GET', new RegExp(`/userImageUrls/user\\?userId=${userId}`), { data: [], message: 'ok' });
}

test.describe('User dashboard', () => {
  test('loads and allows switching tabs', async ({ page }) => {
    await mockUserDashboard(page, 'user-1');
    const dashboard = new UserDashboardPage(page);
    await dashboard.goto('user-1');
    await dashboard.expectTabVisible('weight');
    await dashboard.switchTab('workout');
    await dashboard.switchTab('measurement');
  });
});
