import { test, expect } from '@playwright/test'

test('assessment page loads (smoke)', async ({ page }) => {

  const res = await page.goto('/assessment', { waitUntil: 'domcontentloaded' })
  expect(res?.ok()).toBeTruthy()                // HTTP 200
  const html = await page.content()            
  expect(html.length).toBeGreaterThan(100)
})
