import { jsonRoute, loadJsonFixture, type MockScenarioMap } from "../routes";

const USERS_ENDPOINT = "/users";
const USERS_LOGIN_PATH = `${USERS_ENDPOINT}/user/login`;
const USERS_SESSION_PATH = `${USERS_ENDPOINT}/user/session`;

export const authScenarios = {
  "auth.login.success": [
    jsonRoute({
      method: "POST",
      pathname: USERS_LOGIN_PATH,
      fixture: loadJsonFixture("auth", "login-success.json"),
    }),
  ],
  "auth.login.unauthorized": [
    jsonRoute({
      method: "POST",
      pathname: USERS_LOGIN_PATH,
      fixture: loadJsonFixture("auth", "login-unauthorized.json"),
      status: 401,
    }),
  ],
  "auth.session.valid": [
    jsonRoute({
      method: "POST",
      pathname: USERS_SESSION_PATH,
      fixture: loadJsonFixture("auth", "session-valid.json"),
    }),
  ],
} satisfies MockScenarioMap;
