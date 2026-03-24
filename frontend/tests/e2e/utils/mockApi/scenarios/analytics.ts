import { apiErrorRoute, jsonFixtureRoute, type MockScenarioMap } from "../routes";

const ANALYTICS_ENDPOINT = "/analytics";

export const analyticsScenarios = {
  "analytics.dashboard.success": [
    jsonFixtureRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/checkIns`,
      fixture: "analytics.checkIns",
      variant: "success",
    }),
    jsonFixtureRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/users`,
      fixture: "analytics.users",
      variant: "success",
    }),
    jsonFixtureRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/users/expiring`,
      fixture: "analytics.users-expiring",
      variant: "success",
    }),
  ],
  "analytics.dashboard.populated": [
    jsonFixtureRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/checkIns`,
      fixture: "analytics.checkIns",
      variant: "populated",
    }),
    jsonFixtureRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/users`,
      fixture: "analytics.users",
      variant: "populated",
    }),
    jsonFixtureRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/users/expiring`,
      fixture: "analytics.users-expiring",
      variant: "populated",
    }),
  ],
  "analytics.dashboard.checkins.error": [
    apiErrorRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/checkIns`,
      message:
        "\u05d8\u05e2\u05d9\u05e0\u05ea \u05d4\u05e0\u05ea\u05d5\u05e0\u05d9\u05dd \u05e0\u05db\u05e9\u05dc\u05d4",
      status: 500,
    }),
    jsonFixtureRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/users`,
      fixture: "analytics.users",
      variant: "success",
    }),
    jsonFixtureRoute({
      method: "GET",
      pathname: `${ANALYTICS_ENDPOINT}/users/expiring`,
      fixture: "analytics.users-expiring",
      variant: "success",
    }),
  ],
} satisfies MockScenarioMap;
