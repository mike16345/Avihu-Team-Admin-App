/**
 * Workout template tabs smoke coverage.
 */
import { expect, test } from '@playwright/test';
import { WorkoutTemplatesPage } from '../pom/WorkoutTemplatesPage';
import { useAuthenticated } from '../helpers/auth';
import { interceptJSON } from '../helpers/network';
import {
  workoutPresetsResponse,
  muscleGroupsResponse,
  exercisesResponse,
} from '../fixtures/templates';

useAuthenticated(test);

async function mockWorkoutTemplates(page) {
  await interceptJSON(page, 'GET', '/presets/workoutPlans', workoutPresetsResponse);
  await interceptJSON(page, 'GET', '/muscleGroups', muscleGroupsResponse);
  await interceptJSON(page, 'GET', '/exercises', exercisesResponse);
}

test.describe('Workout templates', () => {
  test('loads presets and switches tabs', async ({ page }) => {
    await mockWorkoutTemplates(page);
    const templates = new WorkoutTemplatesPage(page);
    await templates.goto();
    await expect(page.getByTestId('table-rows')).toBeVisible();
    await templates.switchTab('muscleGroups');
    await expect(page.getByTestId('table-rows')).toBeVisible();
  });
});
