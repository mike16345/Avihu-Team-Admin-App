/**
 * Admin dashboard smoke tests validating analytics widgets and shortcuts.
 */
import { test } from '@playwright/test';
import { AdminDashboardPage } from '../pom/AdminDashboardPage';
import { useAuthenticated } from '../helpers/auth';
import { interceptJSON } from '../helpers/network';
import { usersWithoutPlansResponse, expiringUsersResponse } from '../fixtures/analytics';
import { usersListResponse } from '../fixtures/users';

useAuthenticated(test);

async function mockDashboard(page) {
  await interceptJSON(page, 'GET', '/analytics/users?collection=workoutPlan', usersWithoutPlansResponse);
  await interceptJSON(page, 'GET', '/analytics/users?collection=dietPlan', usersWithoutPlansResponse);
  await interceptJSON(page, 'GET', '/analytics/users/expiring', expiringUsersResponse);
  await interceptJSON(page, 'GET', '/users', usersListResponse);
}

test.describe('Admin dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await mockDashboard(page);
  });

  test('displays shortcuts and analytics list', async ({ page }) => {
    const dashboard = new AdminDashboardPage(page);
    await dashboard.goto();
    await dashboard.expectShortcuts();
  });

  test('carousel controls are interactive', async ({ page }) => {
    const dashboard = new AdminDashboardPage(page);
    await dashboard.goto();
    await dashboard.advanceCarousel();
  });
});
