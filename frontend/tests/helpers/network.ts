import { Page, Route } from '@playwright/test';
import { API_BASE, API_MODE } from './env';

function buildMatcher(path: string | RegExp) {
  if (typeof path === 'string') {
    return `${API_BASE}${path}`;
  }
  const escapedBase = API_BASE.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  return new RegExp(`${escapedBase}${path.source}`, path.flags);
}

export async function interceptJSON(
  page: Page,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  path: string | RegExp,
  body: unknown,
  status = 200
) {
  if (API_MODE === 'live') return;

  const matcher = buildMatcher(path);
  await page.route(matcher, async (route: Route) => {
    if (route.request().method().toUpperCase() !== method) {
      return route.fallback();
    }

    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
}

export async function interceptTimeout(page: Page, method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string | RegExp) {
  if (API_MODE === 'live') return;

  const matcher = buildMatcher(path);
  await page.route(matcher, async (route) => {
    if (route.request().method().toUpperCase() !== method) {
      return route.fallback();
    }
    await route.abort('timedout');
  });
}
