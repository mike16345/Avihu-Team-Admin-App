import { Page, expect } from '@playwright/test';
import { isLiveMode, baseApiUrl, testUserEmail, testUserPassword, requireEnv } from '../helpers/env';
import { ids } from '../helpers/ids';

const trimPath = (path: string) => path.replace(/^\/+/u, '');
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const buildUrlMatcher = (path: string) => {
  const trimmed = trimPath(path);
  if (baseApiUrl) {
    const base = baseApiUrl.replace(/\/$/u, '');
    return new RegExp(`^${escapeRegex(base)}/${escapeRegex(trimmed)}(?:\\?.*)?$`);
  }
  return new RegExp(`/${escapeRegex(trimmed)}(?:\\?.*)?$`);
};

export type UserFixture = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  planType: string;
  dietaryType: string[];
  remindIn: number;
  dateFinished: string;
  dateJoined: string;
  checkInAt: number;
  isChecked: boolean;
  hasAccess: boolean;
};

const now = new Date();
const iso = now.toISOString();

export const usersFixtures = {
  empty: [] as UserFixture[],
  single: [
    {
      _id: 'user-alpha',
      firstName: 'Alpha',
      lastName: 'Tester',
      email: 'alpha@example.com',
      phone: '+972500000001',
      planType: 'מסה',
      dietaryType: [],
      remindIn: 604800,
      dateFinished: iso,
      dateJoined: iso,
      checkInAt: Date.now(),
      isChecked: false,
      hasAccess: true,
    },
  ],
  multiple: [
    {
      _id: 'user-alpha',
      firstName: 'Alpha',
      lastName: 'Tester',
      email: 'alpha@example.com',
      phone: '+972500000001',
      planType: 'מסה',
      dietaryType: [],
      remindIn: 604800,
      dateFinished: iso,
      dateJoined: iso,
      checkInAt: Date.now(),
      isChecked: false,
      hasAccess: true,
    },
    {
      _id: 'user-beta',
      firstName: 'Beta',
      lastName: 'Example',
      email: 'beta@example.com',
      phone: '+972500000002',
      planType: 'חיטוב',
      dietaryType: ['vegan'],
      remindIn: 1209600,
      dateFinished: iso,
      dateJoined: iso,
      checkInAt: Date.now(),
      isChecked: true,
      hasAccess: true,
    },
  ],
  created: {
    _id: 'user-new',
    firstName: 'Gamma',
    lastName: 'Creator',
    email: 'gamma@example.com',
    phone: '+972500000003',
    planType: 'מסה',
    dietaryType: [],
    remindIn: 604800,
    dateFinished: iso,
    dateJoined: iso,
    checkInAt: Date.now(),
    isChecked: false,
    hasAccess: true,
  } as UserFixture,
};

const fulfillJson = (route: any, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

export const apiMatchers = {
  users: buildUrlMatcher('users'),
  userLogin: buildUrlMatcher('users/user/login'),
  userSession: buildUrlMatcher('users/user/session'),
};

export const createSessionPayload = () => {
  const email = requireEnv(testUserEmail, 'E2E_TEST_USER');
  return {
    data: {
      _id: 'session-e2e',
      userId: 'admin-e2e',
      type: 'login',
      data: {
        user: {
          firstName: 'Admin',
          lastName: 'User',
          email,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    message: 'authenticated',
  };
};

export async function mockAuthSuccess(page: Page) {
  if (isLiveMode) return;

  await page.route(apiMatchers.userLogin, async (route) => {
    const { email, password } = route.request().postDataJSON() as { email: string; password: string };
    const expectedEmail = requireEnv(testUserEmail, 'E2E_TEST_USER');
    const expectedPassword = requireEnv(testUserPassword, 'E2E_TEST_PASS');

    if (email !== expectedEmail || password !== expectedPassword) {
      return fulfillJson(route, { message: 'Invalid credentials' }, 401);
    }

    return fulfillJson(route, createSessionPayload());
  });

  await page.route(apiMatchers.userSession, async (route) => fulfillJson(route, { data: { isValid: true }, message: 'ok' }));
}

export async function mockAuthFailure(page: Page) {
  if (isLiveMode) return;
  await page.route(apiMatchers.userLogin, async (route) => fulfillJson(route, { message: 'Invalid credentials' }, 401));
}

export async function seedUsers(page: Page, users: UserFixture[]) {
  const store = [...users];
  if (!isLiveMode) {
    await page.route(apiMatchers.users, async (route) => {
      if (route.request().method() !== 'GET') {
        return route.fallback();
      }
      return fulfillJson(route, { data: store, message: 'ok' });
    });
  }
  return store;
}

export async function mockCreateUserSuccess(page: Page, store: UserFixture[], createdUser: UserFixture) {
  if (isLiveMode) return;
  await page.route(apiMatchers.users, async (route) => {
    if (route.request().method() !== 'POST') {
      return route.fallback();
    }
    store.push(createdUser);
    return fulfillJson(route, { data: createdUser, message: 'created' }, 201);
  });
}

export async function mockCreateUserFailure(page: Page, status = 500, message = 'Server error') {
  if (isLiveMode) return;
  await page.route(apiMatchers.users, async (route) => {
    if (route.request().method() !== 'POST') {
      return route.fallback();
    }
    return fulfillJson(route, { message }, status);
  });
}

export async function withLogin(page: Page) {
  const email = requireEnv(testUserEmail, 'E2E_TEST_USER');
  const password = requireEnv(testUserPassword, 'E2E_TEST_PASS');

  if (!isLiveMode) {
    await mockAuthSuccess(page);
  }

  await page.goto('/');
  await page.waitForURL('**/login');
  await page.getByTestId(ids.formField('email')).fill(email);
  await page.getByTestId(ids.formField('password')).fill(password);
  await page.getByTestId(ids.formSubmit).click();
  await expect(page.getByTestId(ids.navLink('/'))).toBeVisible();
}

export const mockUsersError = async (page: Page, status = 500) => {
  if (isLiveMode) return;
  await page.route(apiMatchers.users, async (route) => {
    if (route.request().method() !== 'GET') {
      return route.fallback();
    }
    return fulfillJson(route, { message: 'Failed to fetch users' }, status);
  });
};
