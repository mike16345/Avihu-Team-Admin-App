import type { Page, Request } from "@playwright/test";
import { mockScenarioRegistry, resolveMockRoutes, type MockScenarioKey } from "./registry";
import { API_RESOURCE_TYPES, normalizePathname, type MockRouteDefinition } from "./routes";

export interface MockApiController {
  enabledScenarios: readonly MockScenarioKey[];
  assertNoUnhandledRequests: () => void;
  getUnhandledRequestErrors: () => readonly Error[];
}

const buildCorsHeaders = (request: Request) => {
  const requestHeaders = request.headers();

  return {
    "access-control-allow-origin": requestHeaders.origin ?? "*",
    "access-control-allow-methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "access-control-allow-headers": requestHeaders["access-control-request-headers"] ?? "*",
  };
};

const isApiRequest = (request: Request) => {
  if (!/^https?:/i.test(request.url())) {
    return false;
  }

  return API_RESOURCE_TYPES.has(request.resourceType());
};

const findMatchingRoute = (
  routes: readonly MockRouteDefinition[],
  method: string,
  pathname: string
) => {
  for (let index = routes.length - 1; index >= 0; index -= 1) {
    const route = routes[index];

    if (route.method === method && route.pathRegex.test(pathname)) {
      return route;
    }
  }

  return undefined;
};

const formatUnhandledRequestError = ({
  enabledScenarios,
  method,
  pathname,
}: {
  enabledScenarios: readonly string[];
  method: string;
  pathname: string;
}) => {
  const scenarioList = enabledScenarios.length > 0 ? enabledScenarios.join(", ") : "(none)";
  const availableScenarios = Object.keys(mockScenarioRegistry).join(", ");

  return [
    `Unmocked API request intercepted: ${method} ${pathname}`,
    `Enabled mock scenarios: ${scenarioList}`,
    `Available mock scenarios: ${availableScenarios}`,
    "Add a matching scenario under tests/e2e/utils/mockApi/scenarios and a JSON fixture under tests/e2e/mocks.",
  ].join("\n");
};

export const installMockApi = async (
  page: Page,
  routes: readonly MockRouteDefinition[],
  enabledScenarios: readonly MockScenarioKey[] = []
): Promise<MockApiController> => {
  const unhandledRequestErrors: Error[] = [];

  await page.route("**/*", async (route) => {
    const request = route.request();

    if (!isApiRequest(request)) {
      await route.continue();
      return;
    }

    const requestUrl = new URL(request.url());
    const pathname = normalizePathname(requestUrl.pathname);
    const method = request.method().toUpperCase();

    if (method === "OPTIONS") {
      await route.fulfill({
        status: 204,
        headers: buildCorsHeaders(request),
      });
      return;
    }

    const matchingRoute = findMatchingRoute(routes, method, pathname);

    if (!matchingRoute) {
      const error = new Error(
        formatUnhandledRequestError({
          enabledScenarios,
          method,
          pathname,
        })
      );

      unhandledRequestErrors.push(error);
      await route.abort("failed");
      throw error;
    }

    await route.fulfill({
      status: matchingRoute.status,
      headers: {
        "content-type": "application/json",
        ...buildCorsHeaders(request),
        ...matchingRoute.headers,
      },
      body: JSON.stringify(matchingRoute.fixture),
    });
  });

  return {
    enabledScenarios: [...enabledScenarios],
    assertNoUnhandledRequests() {
      if (unhandledRequestErrors.length > 0) {
        throw unhandledRequestErrors[0];
      }
    },
    getUnhandledRequestErrors() {
      return [...unhandledRequestErrors];
    },
  };
};

export const useMockApi = async (page: Page, scenarioKeys: readonly MockScenarioKey[]) => {
  const routes = resolveMockRoutes(scenarioKeys);

  return installMockApi(page, routes, scenarioKeys);
};

export type { MockScenarioKey } from "./registry";
