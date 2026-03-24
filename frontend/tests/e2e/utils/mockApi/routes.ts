import { readFileSync } from "node:fs";
import * as path from "node:path";

export const API_RESOURCE_TYPES = new Set(["fetch", "xhr"]);

export type MockApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

type NamedJsonFixtures = Record<string, JsonValue>;

export interface ApiResponseFixture<TData extends JsonValue = JsonValue> {
  data: TData;
  message: string;
}

export interface MockRouteDefinition {
  method: MockApiMethod;
  pathRegex: RegExp;
  pathname: string;
  status: number;
  fixture: JsonValue;
  headers?: Record<string, string>;
  delayMs?: number;
  abortErrorCode?:
    | "aborted"
    | "accessdenied"
    | "connectionaborted"
    | "connectionclosed"
    | "connectionfailed"
    | "connectionrefused"
    | "connectionreset"
    | "internetdisconnected"
    | "namenotresolved"
    | "timedout"
    | "failed";
}

export type MockScenarioMap = Record<string, readonly MockRouteDefinition[]>;
type MockRouteOptions = Pick<MockRouteDefinition, "status" | "headers" | "delayMs">;
const fixtureCache = new Map<string, NamedJsonFixtures>();
const FIXTURE_STATUS_BY_VARIANT = {
  bad_request: 400,
  validation: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  unprocessable_entity: 422,
  rate_limited: 429,
  server: 500,
  internal: 500,
} as const;

const escapeForRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isJsonObject = (value: JsonValue): value is { [key: string]: JsonValue } =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const cloneJsonValue = <T extends JsonValue>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const mergeJsonValue = (fixture: JsonValue, patch?: JsonValue): JsonValue => {
  if (patch === undefined) {
    return cloneJsonValue(fixture);
  }

  if (isJsonObject(fixture) && isJsonObject(patch)) {
    const mergedFixture: { [key: string]: JsonValue } = { ...fixture };

    for (const [key, patchValue] of Object.entries(patch)) {
      const currentValue = mergedFixture[key];

      mergedFixture[key] =
        currentValue === undefined
          ? cloneJsonValue(patchValue)
          : mergeJsonValue(currentValue, patchValue);
    }

    return mergedFixture;
  }

  return cloneJsonValue(patch);
};

const getDefaultStatusForVariant = (variant: string) => {
  if (!variant.startsWith("error_")) {
    return 200;
  }

  const statusKey = variant.slice("error_".length) as keyof typeof FIXTURE_STATUS_BY_VARIANT;
  const status = FIXTURE_STATUS_BY_VARIANT[statusKey];

  if (status === undefined) {
    throw new Error(
      `Unknown error fixture variant "${variant}". Expected one of: ${Object.keys(
        FIXTURE_STATUS_BY_VARIANT
      )
        .map((key) => `error_${key}`)
        .join(", ")}`
    );
  }

  return status;
};

export const normalizePathname = (pathname: string) => {
  if (!pathname || pathname === "/") {
    return "/";
  }

  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLeadingSlash.replace(/\/+$/, "");
};

export const createPathRegex = (pathname: string) => {
  const normalizedPathname = normalizePathname(pathname);
  const trimmedPath = normalizedPathname.slice(1);

  if (!trimmedPath) {
    return /^\/$/;
  }

  return new RegExp(`^/(?:.+/)?${escapeForRegex(trimmedPath)}$`);
};

export const jsonRoute = ({
  method,
  pathname,
  fixture,
  status = 200,
  headers,
  delayMs,
}: {
  method: MockApiMethod;
  pathname: string;
  fixture: JsonValue;
  status?: number;
  headers?: Record<string, string>;
  delayMs?: number;
}): MockRouteDefinition => {
  const normalizedPathname = normalizePathname(pathname);

  return {
    method,
    pathRegex: createPathRegex(normalizedPathname),
    pathname: normalizedPathname,
    status,
    fixture,
    headers,
    delayMs,
  };
};

export const jsonFixtureRoute = ({
  method,
  pathname,
  fixture,
  variant,
  patch,
  status = getDefaultStatusForVariant(variant),
  headers,
  delayMs,
}: {
  method: MockApiMethod;
  pathname: string;
  fixture: string;
  variant: string;
  patch?: JsonValue;
  status?: number;
  headers?: Record<string, string>;
  delayMs?: number;
}): MockRouteDefinition =>
  jsonRoute({
    method,
    pathname,
    fixture: loadJsonFixture(fixture, variant, patch),
    status,
    headers,
    delayMs,
  });

export const abortRoute = ({
  method,
  pathname,
  abortErrorCode = "failed",
  delayMs,
}: {
  method: MockApiMethod;
  pathname: string;
  abortErrorCode?: MockRouteDefinition["abortErrorCode"];
  delayMs?: number;
}): MockRouteDefinition => {
  const normalizedPathname = normalizePathname(pathname);

  return {
    method,
    pathRegex: createPathRegex(normalizedPathname),
    pathname: normalizedPathname,
    status: 0,
    fixture: null,
    delayMs,
    abortErrorCode,
  };
};

export const apiResponseFixture = <TData extends JsonValue>(
  data: TData,
  message: string
): ApiResponseFixture<TData> => ({
  data,
  message,
});

export const errorResponseFixture = (message: string) => apiResponseFixture(null, message);

export const apiRoute = <TData extends JsonValue>({
  method,
  pathname,
  data,
  message,
  status = 200,
  headers,
  delayMs,
}: {
  method: MockApiMethod;
  pathname: string;
  data: TData;
  message: string;
} & MockRouteOptions): MockRouteDefinition =>
  jsonRoute({
    method,
    pathname,
    fixture: apiResponseFixture(data, message),
    status,
    headers,
    delayMs,
  });

export const apiErrorRoute = ({
  method,
  pathname,
  message,
  status,
  headers,
  delayMs,
}: {
  method: MockApiMethod;
  pathname: string;
  message: string;
  status: number;
} & Omit<MockRouteOptions, "status">): MockRouteDefinition =>
  jsonRoute({
    method,
    pathname,
    fixture: errorResponseFixture(message),
    status,
    headers,
    delayMs,
  });

const loadFixtureFile = (fixtureName: string) => {
  const cachedFixture = fixtureCache.get(fixtureName);

  if (cachedFixture) {
    return cachedFixture;
  }

  const fixturePath = path.resolve(
    __dirname,
    "..",
    "..",
    "mocks",
    "fixtures",
    `${fixtureName}.json`
  );
  const fixtureContents = readFileSync(fixturePath, "utf8");
  const parsedFixture = JSON.parse(fixtureContents) as NamedJsonFixtures;

  fixtureCache.set(fixtureName, parsedFixture);

  return parsedFixture;
};

export const loadJsonFixture = <T extends JsonValue>(
  fixtureName: string,
  variant: string,
  patch?: JsonValue
) => {
  const fixtureCollection = loadFixtureFile(fixtureName);
  const fixture = fixtureCollection[variant];

  if (fixture === undefined) {
    throw new Error(`Unknown mock fixture variant "${variant}" in "${fixtureName}"`);
  }

  return mergeJsonValue(fixture, patch) as T;
};
