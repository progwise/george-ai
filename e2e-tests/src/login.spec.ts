import { expect, test } from '@playwright/test'

const E2E_USERNAME = process.env.E2E_USERNAME!
const E2E_PASSWORD = process.env.E2E_PASSWORD!

test('login', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Sign in', exact: false }).click()

  // Keycloak login
  await page.getByRole('textbox', { name: 'Username or email' }).fill(E2E_USERNAME)
  await page.getByRole('textbox', { name: 'Password' }).fill(E2E_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
})
