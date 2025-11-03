/**
 * Users list interactions including load and filtering states.
 */
import { test } from '@playwright/test';
import { useAuthenticated } from '../helpers/auth';
import { interceptJSON } from '../helpers/network';
import { usersListResponse, emptyUsersResponse } from '../fixtures/users';
import { UsersPage } from '../pom/UsersPage';

useAuthenticated(test);

test.describe('Users list', () => {
  test('renders rows when data is available', async ({ page }) => {
    await interceptJSON(page, 'GET', '/users', usersListResponse);
    const users = new UsersPage(page);
    await users.goto();
    await users.expectRows();
  });

  test('shows empty state with no users', async ({ page }) => {
    await interceptJSON(page, 'GET', '/users', emptyUsersResponse);
    const users = new UsersPage(page);
    await users.goto();
    await users.expectEmpty();
  });

  test('can filter users using search input', async ({ page }) => {
    await interceptJSON(page, 'GET', '/users', usersListResponse);
    const users = new UsersPage(page);
    await users.goto();
    await users.search('Dana');
    await users.expectRow('user-1');
  });
});
