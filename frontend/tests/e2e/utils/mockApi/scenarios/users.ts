import { abortRoute, jsonRoute, loadJsonFixture, type MockScenarioMap } from "../routes";

const USERS_ENDPOINT = "/users";
const USERS_ONE_PATH = `${USERS_ENDPOINT}/one`;
const USERS_ONE_FIELD_PATH = `${USERS_ONE_PATH}/field`;
const USER_IMAGE_URLS_PATH = "/userImageUrls/user";

const usersListRoute = (fixtureName: string, status = 200) =>
  jsonRoute({
    method: "GET",
    pathname: USERS_ENDPOINT,
    fixture: loadJsonFixture("users", fixtureName),
    status,
  });

export const usersScenarios = {
  "users.success": [usersListRoute("success.json")],
  "users.large": [usersListRoute("large.json")],
  "users.empty": [usersListRoute("empty.json")],
  "users.malformed": [usersListRoute("malformed.json")],
  "users.error-400": [usersListRoute("error-400.json", 400)],
  "users.error-401": [usersListRoute("error-401.json", 401)],
  "users.error-403": [usersListRoute("error-403.json", 403)],
  "users.error-404": [usersListRoute("error-404.json", 404)],
  "users.error-500": [usersListRoute("error-500.json", 500)],
  "users.network-failure": [
    abortRoute({
      method: "GET",
      pathname: USERS_ENDPOINT,
      abortErrorCode: "failed",
    }),
  ],
  "users.after-delete": [usersListRoute("after-delete.json")],
  "users.one.success": [
    jsonRoute({
      method: "GET",
      pathname: USERS_ONE_PATH,
      fixture: loadJsonFixture("users", "one-success.json"),
    }),
  ],
  "users.access.success": [
    jsonRoute({
      method: "PUT",
      pathname: USERS_ONE_FIELD_PATH,
      fixture: loadJsonFixture("users", "access-success.json"),
    }),
  ],
  "users.delete.precheck.empty": [
    jsonRoute({
      method: "GET",
      pathname: USER_IMAGE_URLS_PATH,
      fixture: loadJsonFixture("users", "user-image-urls-empty.json"),
    }),
  ],
  "users.delete.success": [
    jsonRoute({
      method: "DELETE",
      pathname: USERS_ONE_PATH,
      fixture: loadJsonFixture("users", "delete-success.json"),
    }),
  ],

  // Backward-compatible aliases for the existing scenario keys.
  "users.many.success": [usersListRoute("success.json")],
} satisfies MockScenarioMap;
