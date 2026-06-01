import { apiRoute, type MockScenarioMap } from "../routes";

const MEASUREMENTS_ONE_PATH = "/measurements/one";

export const measurementsScenarios = {
  "measurements.user.empty": [
    apiRoute({
      method: "GET",
      pathname: MEASUREMENTS_ONE_PATH,
      data: {
        userId: "user-created-001",
        measurements: [],
      },
      message: "No measurements",
    }),
  ],
} satisfies MockScenarioMap;
