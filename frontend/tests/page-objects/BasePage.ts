import { Locator, Page, expect } from "@playwright/test";
import { ids } from "../helpers/ids";

export class BasePage {
  constructor(protected readonly page: Page) {}

  async waitForReady() {
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForLoadState("networkidle").catch(() => {});
    const loader = this.page.getByTestId(ids.loading);
    if (await loader.isVisible().catch(() => false)) {
      await expect(loader).toBeHidden();
    }
  }

  async expectToast(locator: Locator) {
    await locator.waitFor({ state: "visible" });
    await locator.waitFor({ state: "detached", timeout: 10_000 }).catch(() => {});
  }
}
