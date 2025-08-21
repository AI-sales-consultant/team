import { defineConfig } from '@playwright/test'

export default defineConfig({

  testDir: './frontend/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'test/playwright-report', open: 'never' }]],
})
