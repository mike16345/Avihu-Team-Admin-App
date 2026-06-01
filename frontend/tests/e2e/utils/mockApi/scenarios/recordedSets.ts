import { apiRoute, type MockScenarioMap } from "../routes";

const RECORDED_SETS_USER_PATH = "/recordedSets/user";

export const recordedSetsScenarios = {
  "recorded-sets.user.empty": [
    apiRoute({
      method: "GET",
      pathname: RECORDED_SETS_USER_PATH,
      data: [],
      message: "No recorded sets",
    }),
  ],
} satisfies MockScenarioMap;
