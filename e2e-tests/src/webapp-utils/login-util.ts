import { Page, expect } from '@playwright/test'

export const E2E_USERNAME = process.env.E2E_USERNAME!
export const E2E_PASSWORD = process.env.E2E_PASSWORD!

export const loginToWebapp = async (page: Page) => {
  // Debug listeners (only enabled in CI or when E2E_DEBUG=true)
  if (process.env.CI || process.env.E2E_DEBUG) {
    page.on('console', (msg) => console.log('BROWSER CONSOLE:', msg.type(), msg.text()))
    page.on('pageerror', (error) => console.log('BROWSER ERROR:', error.message))
    page.on('requestfailed', (request) => console.log('NETWORK FAILED:', request.url(), request.failure()?.errorText))
  }

  // Login
  await page.goto('/')
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Keycloak login
  await page.getByRole('textbox', { name: 'Username or email' }).fill(E2E_USERNAME)
  await page.getByRole('textbox', { name: 'Password' }).fill(E2E_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Wait for login to complete
  await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()
  await page.waitForLoadState('networkidle')
}
