/**
 * Authentication flows covering positive and validation scenarios.
 */
import { test } from '@playwright/test';
import { AuthPage } from '../pom/AuthPage';
import { interceptJSON } from '../helpers/network';
import { loginSuccessResponse } from '../fixtures/auth';
import { usersWithoutPlansResponse, expiringUsersResponse } from '../fixtures/analytics';
import { usersListResponse } from '../fixtures/users';

const ANALYTICS_WORKOUT = '/analytics/users?collection=workoutPlan';
const ANALYTICS_DIET = '/analytics/users?collection=dietPlan';
const ANALYTICS_EXPIRING = '/analytics/users/expiring';

const USERS_ENDPOINT = '/users';

async function mockDashboard(page) {
  await interceptJSON(page, 'GET', ANALYTICS_WORKOUT, usersWithoutPlansResponse);
  await interceptJSON(page, 'GET', ANALYTICS_DIET, usersWithoutPlansResponse);
  await interceptJSON(page, 'GET', ANALYTICS_EXPIRING, expiringUsersResponse);
  await interceptJSON(page, 'GET', USERS_ENDPOINT, usersListResponse);
}

test.describe('Authentication', () => {
  test.use({ storageState: undefined });

  test('successful login redirects to dashboard', async ({ page }) => {
    await mockDashboard(page);
    await interceptJSON(page, 'POST', '/users/user/login', loginSuccessResponse);
    await interceptJSON(page, 'POST', '/users/user/session', { data: { isValid: true }, message: 'ok' });

    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signIn('michaelgani815@gmail.com', 'Subs1234!');
    await auth.expectSignedIn();
  });

  test('invalid email input shows validation error', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.goto();
    await auth.signIn('invalid-email', 'password');
    await auth.expectInvalidCredentials();
  });
});
