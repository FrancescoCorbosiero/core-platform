import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Tereso')
})

test('homepage has description text', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('p')).toContainText('educazione finanziaria')
})
