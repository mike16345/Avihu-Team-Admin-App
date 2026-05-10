import { apiErrorRoute, jsonFixtureRoute, jsonRoute, type MockScenarioMap } from "../routes";

const AUTH_ENDPOINT = "/users/auth";
const AUTH_LOGIN_PATH = `${AUTH_ENDPOINT}/login`;
const AUTH_REFRESH_PATH = `${AUTH_ENDPOINT}/refresh`;
const AUTH_LOGOUT_PATH = `${AUTH_ENDPOINT}/logout`;
const AUTH_ME_PATH = `${AUTH_ENDPOINT}/me`;

export const authScenarios = {
  "auth.login.success": [
    jsonFixtureRoute({
      method: "POST",
      pathname: AUTH_LOGIN_PATH,
      fixture: "auth.login",
      variant: "success",
    }),
  ],
  "auth.login.unauthorized": [
    jsonFixtureRoute({
      method: "POST",
      pathname: AUTH_LOGIN_PATH,
      fixture: "auth.login",
      variant: "error_unauthorized",
    }),
  ],
  "auth.refresh.success": [
    jsonFixtureRoute({
      method: "POST",
      pathname: AUTH_REFRESH_PATH,
      fixture: "auth.login",
      variant: "refresh_success",
    }),
  ],
  "auth.refresh.unauthorized": [
    apiErrorRoute({
      method: "POST",
      pathname: AUTH_REFRESH_PATH,
      message: "\u05d4\u05d4\u05ea\u05d7\u05d1\u05e8\u05d5\u05ea \u05e4\u05d2\u05d4",
      status: 401,
    }),
  ],
  "auth.logout.success": [
    jsonRoute({
      method: "POST",
      pathname: AUTH_LOGOUT_PATH,
      fixture: {},
    }),
  ],
  "auth.me.success": [
    jsonFixtureRoute({
      method: "GET",
      pathname: AUTH_ME_PATH,
      fixture: "auth.login",
      variant: "me_success",
    }),
  ],
} satisfies MockScenarioMap;
