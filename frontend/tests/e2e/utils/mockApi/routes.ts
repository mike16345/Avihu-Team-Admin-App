import { readFileSync } from "node:fs";
import * as path from "node:path";

export const API_RESOURCE_TYPES = new Set(["fetch", "xhr"]);

export type MockApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export interface MockRouteDefinition {
  method: MockApiMethod;
  pathRegex: RegExp;
  pathname: string;
  status: number;
  fixture: JsonValue;
  headers?: Record<string, string>;
}

export type MockScenarioMap = Record<string, readonly MockRouteDefinition[]>;

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
}: {
  method: MockApiMethod;
  pathname: string;
  fixture: JsonValue;
  status?: number;
  headers?: Record<string, string>;
}): MockRouteDefinition => {
  const normalizedPathname = normalizePathname(pathname);

  return {
    method,
    pathRegex: createPathRegex(normalizedPathname),
    pathname: normalizedPathname,
    status,
    fixture,
    headers,
  };
};

export const loadJsonFixture = <T extends JsonValue>(...pathSegments: string[]) => {
  const fixturePath = path.resolve(__dirname, "..", "..", "mocks", ...pathSegments);
  const fixtureContents = readFileSync(fixturePath, "utf8");

  return JSON.parse(fixtureContents) as T;
};
