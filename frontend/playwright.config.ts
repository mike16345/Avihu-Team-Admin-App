import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.VITE_BASE_URL ?? 'http://localhost:5173';
const webServerCommand = process.env.PW_START ?? 'npm run preview -- --host 0.0.0.0 --port 5173';
const webServerPort = Number(process.env.PW_PORT ?? 5173);

export default defineConfig({
  testDir: path.join(__dirname, 'tests/e2e'),
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: webServerCommand,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    port: webServerPort,
  },
});
