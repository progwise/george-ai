import { expect, test } from '@playwright/test'

const E2E_USERNAME = process.env.E2E_USERNAME!
const E2E_PASSWORD = process.env.E2E_PASSWORD!

test('login', async ({ page }) => {
  // Listen for console messages
  page.on('console', (msg) => console.log('BROWSER CONSOLE:', msg.type(), msg.text()))

  // Listen for page errors
  page.on('pageerror', (error) => console.log('BROWSER ERROR:', error.message))

  // Listen for network failures
  page.on('requestfailed', (request) => console.log('NETWORK FAILED:', request.url(), request.failure()?.errorText))

  await page.goto('/')

  // Wait a bit to see console/network errors
  await page.waitForTimeout(5000)

  await page.getByRole('button', { name: 'Sign in', exact: false }).click()

  // Keycloak login
  await page.getByRole('textbox', { name: 'Username or email' }).fill(E2E_USERNAME)
  await page.getByRole('textbox', { name: 'Password' }).fill(E2E_PASSWORD)
  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()
  await expect(
    page.getByRole('tab', {
      name: /libraries/i,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('tab', {
      name: /lists/i,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('tab', {
      name: /assistants/i,
    }),
  ).toBeVisible()
  await expect(
    page.getByRole('tab', {
      name: /conversations/i,
    }),
  ).toBeVisible()
})
