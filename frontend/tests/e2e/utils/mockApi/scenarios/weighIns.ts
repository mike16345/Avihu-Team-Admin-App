import { apiRoute, type MockScenarioMap } from "../routes";

const WEIGH_INS_USER_PATH = "/weighIns/weights/user";

export const weighInsScenarios = {
  "weigh-ins.user.empty": [
    apiRoute({
      method: "GET",
      pathname: WEIGH_INS_USER_PATH,
      data: [],
      message: "No weigh-ins",
    }),
  ],
} satisfies MockScenarioMap;
