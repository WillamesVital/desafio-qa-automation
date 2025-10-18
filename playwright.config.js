// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'https://demoqa.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 20_000,
  },
  projects: [
    // Só API
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.(js|ts)/,
    },
    // Navegadores (ignoram API)
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /tests\/api\/.*/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testIgnore: /tests\/api\/.*/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testIgnore: /tests\/api\/.*/,
    },
  ],
  retries: process.env.CI ? 1 : 1,
  workers: process.env.CI ? 2 : undefined,
});

