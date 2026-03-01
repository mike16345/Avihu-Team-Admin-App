import { jsonRoute, loadJsonFixture, type MockScenarioMap } from "../routes";

const USERS_ENDPOINT = "/users";
const USERS_ONE_PATH = `${USERS_ENDPOINT}/one`;

export const usersScenarios = {
  "users.many.success": [
    jsonRoute({
      method: "GET",
      pathname: USERS_ENDPOINT,
      fixture: loadJsonFixture("users", "many-success.json"),
    }),
  ],
  "users.one.success": [
    jsonRoute({
      method: "GET",
      pathname: USERS_ONE_PATH,
      fixture: loadJsonFixture("users", "one-success.json"),
    }),
  ],
  "users.delete.success": [
    jsonRoute({
      method: "DELETE",
      pathname: USERS_ONE_PATH,
      fixture: loadJsonFixture("users", "delete-success.json"),
    }),
  ],
} satisfies MockScenarioMap;
