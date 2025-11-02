import { test, expect } from "@playwright/test";
import { EntitiesPage } from "../page-objects/EntitiesPage";
import { seedUsers, usersFixtures, withLogin } from "../fixtures/entities";
import { isLiveMode } from "../helpers/env";

test.describe("Users table: load states", () => {
  test.beforeEach(async ({ page }) => {
    await withLogin(page);
  });

  test("shows empty state when no data is returned", async ({ page }) => {
    if (!isLiveMode) {
      await seedUsers(page, usersFixtures.empty);
    }
    const entitiesPage = new EntitiesPage(page);
    await entitiesPage.gotoList();
    await entitiesPage.waitForListLoaded();
    await expect(entitiesPage.emptyState).toBeVisible();
  });

  test("renders rows when users exist", async ({ page }) => {
    if (!isLiveMode) {
      await seedUsers(page, usersFixtures.multiple);
    }

    const entitiesPage = new EntitiesPage(page);
    await entitiesPage.gotoList();
    await entitiesPage.waitForListLoaded();

    if (isLiveMode) {
      await expect(entitiesPage.tableRows).toBeVisible();
    } else {
      await expect(page.getByTestId("row-user-alpha")).toBeVisible();
      await expect(page.getByTestId("row-user-beta")).toBeVisible();
    }
  });
});
