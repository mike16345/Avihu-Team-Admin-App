import { apiRoute, jsonFixtureRoute, type MockScenarioMap } from "../routes";

const USERS_ENDPOINT = "/users";
const USERS_LOGIN_PATH = `${USERS_ENDPOINT}/user/login`;
const USERS_SESSION_PATH = `${USERS_ENDPOINT}/user/session`;

export const authScenarios = {
  "auth.login.success": [
    jsonFixtureRoute({
      method: "POST",
      pathname: USERS_LOGIN_PATH,
      fixturePath: ["auth", "login-success.json"],
    }),
  ],
  "auth.login.unauthorized": [
    jsonFixtureRoute({
      method: "POST",
      pathname: USERS_LOGIN_PATH,
      fixturePath: ["auth", "login-unauthorized.json"],
      status: 401,
    }),
  ],
  "auth.session.valid": [
    apiRoute({
      method: "POST",
      pathname: USERS_SESSION_PATH,
      data: {
        isValid: true,
      },
      message: "\u05d4\u05e1\u05e9\u05df \u05ea\u05e7\u05d9\u05df",
    }),
  ],
} satisfies MockScenarioMap;
