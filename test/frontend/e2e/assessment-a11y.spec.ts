
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
test('assessment page a11y', async ({ page }) => {
  await page.goto('/assessment', { waitUntil: 'domcontentloaded' })
  const results = await new AxeBuilder({ page }).analyze()
  const serious = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
  expect(serious, JSON.stringify(serious, null, 2)).toHaveLength(0)
})
