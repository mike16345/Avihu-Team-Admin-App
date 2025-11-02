export const apiMode = (process.env.PLAYWRIGHT_API_MODE ?? "mock").toLowerCase();
export const isLiveMode = apiMode === "live";
export const baseApiUrl = process.env.VITE_API_BASE ?? process.env.VITE_SERVER ?? "";
export const baseAppUrl = process.env.VITE_BASE_URL ?? "http://localhost:5173";
export const testUserEmail = process.env.E2E_TEST_USER ?? "";
export const testUserPassword = process.env.E2E_TEST_PASS ?? "";

export const requireEnv = (value: string | undefined, name: string) => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};
