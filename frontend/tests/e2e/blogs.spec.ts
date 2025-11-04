/**
 * Blog listing page scenarios: loading, filtering, and navigation.
 */
import { expect, test } from '@playwright/test';
import { BlogListPage } from '../pom/BlogListPage';
import { useAuthenticated } from '../helpers/auth';
import { interceptJSON } from '../helpers/network';
import { blogsPageResponse, emptyBlogsPageResponse, blogGroupsResponse } from '../fixtures/blogs';

useAuthenticated(test);

async function mockBlogs(page, response = blogsPageResponse) {
  await interceptJSON(page, 'GET', /\/blogs\/paginate.*/, response);
  await interceptJSON(page, 'GET', '/lessonGroups', blogGroupsResponse);
}

test.describe('Blogs list', () => {
  test('renders blog cards and allows filtering', async ({ page }) => {
    await mockBlogs(page);
    const blogs = new BlogListPage(page);
    await blogs.goto();
    await blogs.expectBlogCard('blog-1');
    await blogs.filterByGroup('כושר');
    await blogs.expectBlogCard('blog-1');
  });

  test('shows empty state when no blogs exist', async ({ page }) => {
    await mockBlogs(page, emptyBlogsPageResponse);
    const blogs = new BlogListPage(page);
    await blogs.goto();
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });

  test('navigates to blog creation form', async ({ page }) => {
    await mockBlogs(page);
    const blogs = new BlogListPage(page);
    await blogs.goto();
    await blogs.openCreate();
    await expect(page).toHaveURL(/\/blogs\/create/);
  });
});
