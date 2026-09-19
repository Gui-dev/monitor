import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  forbidOnly: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'pnpm dev:agent',
      port: 3001,
      reuseExistingServer: true,
    },
    {
      command: 'pnpm dev:dashboard',
      port: 3000,
      reuseExistingServer: true,
    },
  ],
})
