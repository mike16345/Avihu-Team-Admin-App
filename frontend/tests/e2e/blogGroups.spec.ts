/**
 * Blog groups presets list behaviours.
 */
import { expect, test } from '@playwright/test';
import { BlogGroupsPage } from '../pom/BlogGroupsPage';
import { useAuthenticated } from '../helpers/auth';
import { interceptJSON } from '../helpers/network';
import { blogGroupsResponse } from '../fixtures/blogs';

useAuthenticated(test);

test.describe('Blog groups', () => {
  test('lists groups and opens creation sheet', async ({ page }) => {
    await interceptJSON(page, 'GET', '/lessonGroups', blogGroupsResponse);

    const groups = new BlogGroupsPage(page);
    await groups.goto();
    await expect(page.getByTestId('table-rows')).toBeVisible();
    await groups.openCreate();
    await expect(page.getByTestId('tab-lessonGroups-add')).toBeVisible();
  });
});
