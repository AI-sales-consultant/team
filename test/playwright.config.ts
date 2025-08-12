
import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './test/frontend/e2e',
  use: { baseURL: 'http://localhost:3000' },
  reporter: [['list'], ['html', { outputFolder: 'test/playwright-report', open: 'never' }]]
})
