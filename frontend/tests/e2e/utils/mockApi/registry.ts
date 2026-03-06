import { analyticsScenarios } from "./scenarios/analytics";
import { authScenarios } from "./scenarios/auth";
import { blogsScenarios } from "./scenarios/blogs";
import { dietPlansScenarios } from "./scenarios/dietPlans";
import { leadsScenarios } from "./scenarios/leads";
import { measurementsScenarios } from "./scenarios/measurements";
import { presetsScenarios } from "./scenarios/presets";
import { recordedSetsScenarios } from "./scenarios/recordedSets";
import { usersScenarios } from "./scenarios/users";
import { weighInsScenarios } from "./scenarios/weighIns";
import { workoutPlansScenarios } from "./scenarios/workoutPlans";
import type { MockRouteDefinition } from "./routes";

export const mockScenarioRegistry = {
  ...analyticsScenarios,
  ...authScenarios,
  ...blogsScenarios,
  ...dietPlansScenarios,
  ...leadsScenarios,
  ...measurementsScenarios,
  ...presetsScenarios,
  ...recordedSetsScenarios,
  ...usersScenarios,
  ...weighInsScenarios,
  ...workoutPlansScenarios,
};

export type MockScenarioKey = keyof typeof mockScenarioRegistry;

type MockRouteOverrides = Partial<
  Pick<MockRouteDefinition, "status" | "headers" | "delayMs" | "abortErrorCode">
>;

export type MockScenarioSelection =
  | MockScenarioKey
  | {
      key: MockScenarioKey;
      overrides?: MockRouteOverrides;
    };

export const getScenarioKey = (scenario: MockScenarioSelection): MockScenarioKey =>
  typeof scenario === "string" ? scenario : scenario.key;

export const resolveMockRoutes = (
  scenarioSelections: readonly MockScenarioSelection[]
): MockRouteDefinition[] => {
  return scenarioSelections.flatMap((scenarioSelection) => {
    const scenarioKey = getScenarioKey(scenarioSelection);
    const routes = mockScenarioRegistry[scenarioKey];

    if (!routes) {
      throw new Error(`Unknown mock API scenario: ${scenarioKey}`);
    }

    const overrides =
      typeof scenarioSelection === "string" ? undefined : scenarioSelection.overrides;

    return routes.map((route) => ({
      ...route,
      ...overrides,
      headers: {
        ...route.headers,
        ...overrides?.headers,
      },
    }));
  });
};
