import { expect, test } from "@playwright/test";
import { installMockApi } from "../utils/mockApi";
import { loginAsAdmin } from "../utils/adminSession";

test.setTimeout(60_000);

const completeBlogPage = {
  results: [
    {
      _id: "blog-local-match",
      title: "Local Match Article",
      subtitle: "Already loaded",
      content: "<p>This article is present in the first page.</p>",
      group: { _id: "group-1", name: "Guides" },
      planType: "General",
      imageUrl: "",
      link: "",
    },
    {
      _id: "blog-other",
      title: "Different Article",
      subtitle: "No match",
      content: "<p>Another article.</p>",
      group: { _id: "group-1", name: "Guides" },
      planType: "General",
      imageUrl: "",
      link: "",
    },
  ],
  totalResults: 2,
  totalPages: 1,
  currentPage: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

test("filters complete article pages locally without querying the server search", async ({
  page,
}) => {
  const mockApi = await installMockApi(page);
  const blogSearchRequests: string[] = [];

  await page.route("**/blogs/paginate**", async (route) => {
    const requestUrl = new URL(route.request().url());
    const queryParam = requestUrl.searchParams.get("query");

    if (queryParam?.includes("search")) {
      blogSearchRequests.push(requestUrl.toString());
      await route.fulfill({
        status: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          data: {
            results: [],
            totalResults: 0,
            totalPages: 1,
            currentPage: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
          message: "Search returned no results",
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: completeBlogPage, message: "Blogs loaded" }),
    });
  });

  mockApi.useScenario("auth.login.success", "analytics.dashboard.success");
  await loginAsAdmin(page);
  mockApi.useScenario("analytics.dashboard.success", "users.success", "blogs.success");

  await page.getByTestId("sidebar-link-blogs").click();
  await expect(page.getByText("Local Match Article")).toBeVisible();

  await page.getByRole("textbox").fill("Local Match");

  await expect(page.getByText("Local Match Article")).toBeVisible();
  await expect(page.getByText("Different Article")).toHaveCount(0);
  await expect.poll(() => blogSearchRequests.length).toBe(0);

  mockApi.assertNoUnhandledRequests();
});
