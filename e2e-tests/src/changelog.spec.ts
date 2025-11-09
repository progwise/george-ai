import { expect, test } from '@playwright/test'

const E2E_USERNAME = process.env.E2E_USERNAME!
const E2E_PASSWORD = process.env.E2E_PASSWORD!

test.describe('Changelog', () => {
  test('displays formatted changelog from settings dropdown', async ({ page }) => {
    // Debug listeners (only enabled in CI or when E2E_DEBUG=true)
    if (process.env.CI || process.env.E2E_DEBUG) {
      page.on('console', (msg) => console.log('BROWSER CONSOLE:', msg.type(), msg.text()))
      page.on('pageerror', (error) => console.log('BROWSER ERROR:', error.message))
      page.on('requestfailed', (request) => console.log('NETWORK FAILED:', request.url(), request.failure()?.errorText))
    }

    await page.goto('/')

    // Login
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.getByRole('textbox', { name: 'Username or email' }).fill(E2E_USERNAME)
    await page.getByRole('textbox', { name: 'Password' }).fill(E2E_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Wait for dashboard to load
    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()

    // Open settings dropdown
    await page.getByRole('button', { name: /settings/i }).click()

    // Click changelog link
    await page.getByRole('link', { name: /changelog/i }).click()

    // Verify we're on the changelog page
    await expect(page).toHaveURL(/\/changelog/)

    // Verify the page contains formatted markdown content
    // Check for the main heading
    await expect(page.getByRole('heading', { name: 'Changelog', level: 1 })).toBeVisible()

    // Check for section headings (these should be rendered as headings, not raw markdown)
    await expect(page.getByRole('heading', { name: /unreleased/i })).toBeVisible()

    // Verify markdown is rendered (not raw)
    // The content should NOT contain raw markdown syntax like "##" or "###"
    const content = await page.locator('.prose').textContent()
    expect(content).toBeTruthy()
    expect(content).not.toContain('## [unreleased]')
    expect(content).not.toContain('### Added')

    // Check for some actual changelog content
    expect(content).toContain('Added')
    expect(content).toContain('Changed')
    expect(content).toContain('Fixed')
  })

  test('can access changelog directly via URL', async ({ page }) => {
    await page.goto('/')

    // Login
    await page.getByRole('button', { name: 'Sign in' }).click()
    await page.getByRole('textbox', { name: 'Username or email' }).fill(E2E_USERNAME)
    await page.getByRole('textbox', { name: 'Password' }).fill(E2E_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Navigate directly to changelog
    await page.goto('/changelog')

    // Verify the page loads correctly
    await expect(page.getByRole('heading', { name: 'Changelog', level: 1 })).toBeVisible()

    // Verify content is rendered
    const content = await page.locator('.prose').textContent()
    expect(content).toBeTruthy()
    expect(content).toContain('unreleased')
  })
})
