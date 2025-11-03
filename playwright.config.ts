import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: false,
  retries: isCI ? 2 : 0,
  use: {
    baseURL: process.env.VITE_BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/storageState.json' },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: 'tests/.auth/storageState.json' },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: 'tests/.auth/storageState.json' },
    },
  ],
  reporter: [['list'], ['html', { open: 'never' }]],
});
