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
type FixturePath = readonly [string, ...string[]];

const escapeForRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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
  fixturePath,
  status = 200,
  headers,
  delayMs,
}: {
  method: MockApiMethod;
  pathname: string;
  fixturePath: FixturePath;
  status?: number;
  headers?: Record<string, string>;
  delayMs?: number;
}): MockRouteDefinition =>
  jsonRoute({
    method,
    pathname,
    fixture: loadJsonFixture(...fixturePath),
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

export const loadJsonFixture = <T extends JsonValue>(...pathSegments: string[]) => {
  const fixturePath = path.resolve(__dirname, "..", "..", "mocks", ...pathSegments);
  const fixtureContents = readFileSync(fixturePath, "utf8");

  return JSON.parse(fixtureContents) as T;
};
