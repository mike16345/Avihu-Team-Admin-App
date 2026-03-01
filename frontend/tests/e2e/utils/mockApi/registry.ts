import { authScenarios } from "./scenarios/auth";
import { usersScenarios } from "./scenarios/users";
import type { MockRouteDefinition } from "./routes";

export const mockScenarioRegistry = {
  ...authScenarios,
  ...usersScenarios,
};

export type MockScenarioKey = keyof typeof mockScenarioRegistry;

export const resolveMockRoutes = (scenarioKeys: readonly MockScenarioKey[]): MockRouteDefinition[] => {
  return scenarioKeys.flatMap((scenarioKey) => {
    const routes = mockScenarioRegistry[scenarioKey];

    if (!routes) {
      throw new Error(`Unknown mock API scenario: ${scenarioKey}`);
    }

    return routes.map((route) => ({ ...route }));
  });
};
