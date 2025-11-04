/**
 * Blog creation flows covering success and server error handling.
 */
import { expect, test } from '@playwright/test';
import { BlogEditorPage } from '../pom/BlogEditorPage';
import { useAuthenticated } from '../helpers/auth';
import { interceptJSON } from '../helpers/network';
import { blogGroupsResponse, createBlogResponse, blogsPageResponse } from '../fixtures/blogs';

useAuthenticated(test);

async function mockBlogEditor(page) {
  await interceptJSON(page, 'GET', '/lessonGroups', blogGroupsResponse);
}

async function mockBlogsList(page) {
  await interceptJSON(page, 'GET', /\/blogs\/paginate.*/, blogsPageResponse);
  await interceptJSON(page, 'GET', '/lessonGroups', blogGroupsResponse);
}

test.describe('Blog editor', () => {
  test('create blog → success', async ({ page }) => {
    await mockBlogEditor(page);
    await interceptJSON(page, 'POST', '/blogs', createBlogResponse);
    await mockBlogsList(page);

    const editor = new BlogEditorPage(page);
    await editor.gotoCreate();
    await editor.fillForm({
      title: 'מדריך תזונה',
      planType: 'כללי',
      group: 'כללי',
      mediaType: 'link',
      link: 'https://example.com/video',
      content: 'תוכן מלא',
    });
    await editor.submit();
    await expect(page).toHaveURL(/\/blogs$/);
  });

  test('create blog → server error keeps user on form', async ({ page }) => {
    await mockBlogEditor(page);
    await interceptJSON(page, 'POST', '/blogs', { data: null, message: 'error' }, 500);

    const editor = new BlogEditorPage(page);
    await editor.gotoCreate();
    await editor.fillForm({
      title: 'מאמר בדיקה',
      planType: 'כללי',
      group: 'כללי',
      mediaType: 'link',
      link: 'https://example.com/fail',
      content: 'תוכן',
    });
    await editor.submit();
    await expect(page).toHaveURL(/\/blogs\/create/);
  });
});
