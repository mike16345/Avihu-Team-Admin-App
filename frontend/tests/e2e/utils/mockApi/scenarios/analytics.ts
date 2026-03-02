import { jsonRoute, loadJsonFixture, type MockScenarioMap } from "../routes";

const ANALYTICS_ENDPOINT = "/analytics";

export const analyticsScenarios = {
  "analytics.dashboard.success": [
    jsonRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/checkIns`,
      fixture: loadJsonFixture("analytics", "check-ins-success.json"),
    }),
    jsonRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/users`,
      fixture: loadJsonFixture("analytics", "users-without-plans-success.json"),
    }),
    jsonRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/users/expiring`,
      fixture: loadJsonFixture("analytics", "expiring-users-success.json"),
    }),
  ],
  "analytics.dashboard.populated": [
    jsonRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/checkIns`,
      fixture: loadJsonFixture("analytics", "check-ins-populated.json"),
    }),
    jsonRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/users`,
      fixture: loadJsonFixture("analytics", "users-without-plans-populated.json"),
    }),
    jsonRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/users/expiring`,
      fixture: loadJsonFixture("analytics", "expiring-users-populated.json"),
    }),
  ],
  "analytics.dashboard.checkins.error": [
    jsonRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/checkIns`,
      fixture: loadJsonFixture("analytics", "error.json"),
      status: 500,
    }),
    jsonRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/users`,
      fixture: loadJsonFixture("analytics", "users-without-plans-success.json"),
    }),
    jsonRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/users/expiring`,
      fixture: loadJsonFixture("analytics", "expiring-users-success.json"),
    }),
  ],
} satisfies MockScenarioMap;
