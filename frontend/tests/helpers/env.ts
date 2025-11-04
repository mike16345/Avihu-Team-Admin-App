export const BASE_URL = process.env.VITE_BASE_URL ?? "http://localhost:3000";
export const API_BASE = process.env.VITE_API_BASE ?? "https://api.mock.local";
export const E2E_USER = process.env.VITE_E2E_TEST_USER ?? "";
export const E2E_PASS = process.env.VITE_E2E_TEST_PASS ?? "";
export const API_MODE = (process.env.PLAYWRIGHT_API_MODE ?? "mock") as "mock" | "live";
export const STORAGE_STATE = "tests/.auth/storageState.json";
export const ALLOW_LIVE_DELETE = process.env.ALLOW_LIVE_DELETE === "true";

export function requireEnv(value: string, name: string) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name} value:${value}`);
  }
  return value;
}
