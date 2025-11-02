import { test, expect } from "@playwright/test";
import { EntitiesPage } from "../page-objects/EntitiesPage";
import { mockCreateUserSuccess, seedUsers, usersFixtures, withLogin } from "../fixtures/entities";
import { isLiveMode } from "../helpers/env";

test.describe("Users table: create", () => {
  test.beforeEach(async ({ page }) => {
    if (!isLiveMode) {
      const store = await seedUsers(page, usersFixtures.single);
      await mockCreateUserSuccess(page, store, usersFixtures.created);
    }
    await withLogin(page);
  });

  test.skip(isLiveMode, "Live mode create flow requires isolated data set.");

  test("creates a new user and shows success toast", async ({ page }) => {
    const entitiesPage = new EntitiesPage(page);
    await entitiesPage.gotoList();
    await entitiesPage.waitForListLoaded();
    await entitiesPage.openCreateForm();
    await entitiesPage.fillUserForm({
      firstName: usersFixtures.created.firstName,
      lastName: usersFixtures.created.lastName,
      email: usersFixtures.created.email,
      phone: usersFixtures.created.phone,
      planType: "מסה",
      remindIn: "שבוע",
    });
    await entitiesPage.submitFormExpectSuccess();

    await page.waitForURL("**/users/**");
    await entitiesPage.gotoList();
    await entitiesPage.waitForListLoaded();
    await entitiesPage.expectRowPresent(usersFixtures.created._id);
  });
});
