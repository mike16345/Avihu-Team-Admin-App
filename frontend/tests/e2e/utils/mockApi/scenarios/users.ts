import {
  abortRoute,
  apiErrorRoute,
  apiRoute,
  jsonFixtureRoute,
  type MockScenarioMap,
} from "../routes";

const USERS_ENDPOINT = "/users";
const USERS_ONE_PATH = `${USERS_ENDPOINT}/one`;
const USERS_ONE_FIELD_PATH = `${USERS_ONE_PATH}/field`;
const USER_IMAGE_URLS_PATH = "/userImageUrls/user";

const USERS_ERROR_MESSAGES = {
  400: "Bad request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Users endpoint not found",
  500: "Server error",
} as const;

const CREATE_USER_ERROR_MESSAGES = {
  400: "Bad create request",
  401: "Unauthorized create request",
  403: "Forbidden create request",
  404: "Create user endpoint not found",
  500: "Create user failed",
} as const;

const usersListRoute = (variant: string) =>
  jsonFixtureRoute({
    method: "GET",
    pathname: USERS_ENDPOINT,
    fixture: "users.collection",
    variant,
  });

const usersErrorRoute = (
  status: keyof typeof USERS_ERROR_MESSAGES,
  message = USERS_ERROR_MESSAGES[status]
) =>
  apiErrorRoute({
    method: "GET",
    pathname: USERS_ENDPOINT,
    message,
    status,
  });

const createUserErrorRoute = (
  status: keyof typeof CREATE_USER_ERROR_MESSAGES,
  message = CREATE_USER_ERROR_MESSAGES[status]
) =>
  apiErrorRoute({
    method: "POST",
    pathname: USERS_ENDPOINT,
    message,
    status,
  });

export const usersScenarios = {
  "users.success": [usersListRoute("success")],
  "users.large": [usersListRoute("large")],
  "users.empty": [usersListRoute("empty")],
  "users.malformed": [usersListRoute("malformed")],
  "users.error-400": [usersErrorRoute(400)],
  "users.error-401": [usersErrorRoute(401)],
  "users.error-403": [usersErrorRoute(403)],
  "users.error-404": [usersErrorRoute(404)],
  "users.error-500": [usersErrorRoute(500)],
  "users.network-failure": [
    abortRoute({
      method: "GET",
      pathname: USERS_ENDPOINT,
      abortErrorCode: "failed",
    }),
  ],
  "users.after-delete": [usersListRoute("after_delete")],
  "users.one.success": [
    jsonFixtureRoute({
      method: "GET",
      pathname: USERS_ONE_PATH,
      fixture: "users.one",
      variant: "success",
    }),
  ],
  "users.access.success": [
    jsonFixtureRoute({
      method: "PUT",
      pathname: USERS_ONE_FIELD_PATH,
      fixture: "users.one",
      variant: "success",
      patch: {
        data: {
          hasAccess: false,
        },
        message: "User access updated",
      },
    }),
  ],
  "users.delete.precheck.empty": [
    apiRoute({
      method: "GET",
      pathname: USER_IMAGE_URLS_PATH,
      data: [],
      message: "No user images",
    }),
  ],
  "users.delete.success": [
    apiRoute({
      method: "DELETE",
      pathname: USERS_ONE_PATH,
      data: null,
      message: "\u05d4\u05de\u05e9\u05ea\u05de\u05e9 \u05e0\u05de\u05d7\u05e7",
    }),
  ],
  "users.create.success": [
    apiRoute({
      method: "POST",
      pathname: USERS_ENDPOINT,
      data: { _id: "user-created-001" },
      message: "User created",
    }),
  ],
  "users.create.empty": [
    apiRoute({
      method: "POST",
      pathname: USERS_ENDPOINT,
      data: {},
      message: "User created without an id",
    }),
  ],
  "users.create.error-400": [createUserErrorRoute(400)],
  "users.create.error-401": [createUserErrorRoute(401)],
  "users.create.error-403": [createUserErrorRoute(403)],
  "users.create.error-404": [createUserErrorRoute(404)],
  "users.create.error-500": [createUserErrorRoute(500)],
  "users.create.network-failure": [
    abortRoute({
      method: "POST",
      pathname: USERS_ENDPOINT,
      abortErrorCode: "failed",
    }),
  ],

  // Backward-compatible aliases for the existing scenario keys.
  "users.many.success": [usersListRoute("success")],
} satisfies MockScenarioMap;
