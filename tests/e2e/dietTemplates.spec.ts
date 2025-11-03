/**
 * Diet template tabs smoke coverage.
 */
import { expect, test } from '@playwright/test';
import { DietTemplatesPage } from '../pom/DietTemplatesPage';
import { useAuthenticated } from '../helpers/auth';
import { interceptJSON } from '../helpers/network';
import { dietPlanPresetsResponse, menuItemsResponse } from '../fixtures/templates';

useAuthenticated(test);

async function mockDietTemplates(page) {
  await interceptJSON(page, 'GET', '/presets/dietPlans', dietPlanPresetsResponse);
  await interceptJSON(page, 'GET', new RegExp('/menuItems/foodGroup\\?foodGroup=protein'), menuItemsResponse);
}

test.describe('Diet templates', () => {
  test('loads presets and switches to protein tab', async ({ page }) => {
    await mockDietTemplates(page);
    const templates = new DietTemplatesPage(page);
    await templates.goto();
    await expect(page.getByTestId('table-rows')).toBeVisible();
    await templates.switchTab('proteinItems');
    await expect(page.getByTestId('table-rows')).toBeVisible();
  });
});
