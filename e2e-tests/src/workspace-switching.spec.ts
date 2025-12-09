import { expect, test } from '@playwright/test'

import { loginToWebapp } from './webapp-utils/login-util'
import { switchWorkspace, workspaceSwitcher } from './webapp-utils/workspace-switcher-util'

/**
 * Workspace Switching - Page Navigation Tests
 *
 * Tests that switching workspaces works correctly from various pages
 * without causing console errors, failed network requests, or crashes.
 *
 * Test data is created in global-setup.ts:
 * - E2E Test Workspace 1: Library, List, Automation, Assistant
 * - E2E Test Workspace 2: Library, List, Automation, Assistant
 */
test.describe('Workspace Switching - All Pages', () => {
  let consoleErrors: string[] = []
  let networkFailures: string[] = []

  test.beforeEach(async ({ page }) => {
    consoleErrors = []
    networkFailures = []

    // Track errors during test
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    page.on('pageerror', (error) => {
      consoleErrors.push(error.message)
    })

    page.on('requestfailed', (request) => {
      const failure = request.failure()?.errorText || 'unknown'
      if (!failure.includes('net::ERR_ABORTED')) {
        networkFailures.push(`${request.url()} - ${failure}`)
      }
    })

    await loginToWebapp(page)
  })

  const expectNoErrors = () => {
    const criticalErrors = consoleErrors.filter(
      (e) =>
        !e.includes('Warning') && !e.includes('DevTools') && !e.includes('favicon') && !e.includes('CancelledError'), // Expected when switching workspaces - TanStack Query cancels pending queries
    )
    expect(criticalErrors).toHaveLength(0)
    expect(networkFailures).toHaveLength(0)
  }

  test('should switch workspace from Dashboard without errors', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()

    await switchWorkspace(page, 'E2E Test Workspace 1')
    await switchWorkspace(page, 'E2E Test Workspace 2')

    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()
    expectNoErrors()
  })

  test('should switch workspace from Libraries page without errors', async ({ page }) => {
    await page.getByRole('tab', { name: /libraries/i }).click()
    await page.waitForLoadState('networkidle')

    await switchWorkspace(page, 'E2E Test Workspace 1')
    await expect(page.getByText('E2E Test Library - Field Modal')).toBeVisible()

    await switchWorkspace(page, 'E2E Test Workspace 2')
    await expect(page.getByText('E2E Test Library - WS2')).toBeVisible()
    await expect(page.getByText('E2E Test Library - Field Modal')).not.toBeVisible()

    expectNoErrors()
  })

  test('should switch workspace from Library detail page without errors', async ({ page }) => {
    await page.getByRole('tab', { name: /libraries/i }).click()
    await page.waitForLoadState('networkidle')

    await switchWorkspace(page, 'E2E Test Workspace 1')

    // Go to library detail
    await page.getByText('E2E Test Library - Field Modal').click()
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/libraries/')

    // Switch workspace from detail page
    await switchWorkspace(page, 'E2E Test Workspace 2')
    await page.waitForLoadState('networkidle')

    // Should show WS2 content
    await expect(page.getByText('E2E Test Library - WS2')).toBeVisible()

    expectNoErrors()
  })

  test('should switch workspace from Lists page without errors', async ({ page }) => {
    await page.getByRole('tab', { name: /lists/i }).click()
    await page.waitForLoadState('networkidle')

    await switchWorkspace(page, 'E2E Test Workspace 1')
    await expect(page.getByText('E2E Test List - Field Modal').first()).toBeVisible()

    await switchWorkspace(page, 'E2E Test Workspace 2')
    await expect(page.getByText('E2E Test List - WS2').first()).toBeVisible()

    expectNoErrors()
  })

  test('should switch workspace from Automations page without errors', async ({ page }) => {
    await page.goto('/automations')
    await page.waitForLoadState('networkidle')

    await switchWorkspace(page, 'E2E Test Workspace 1')
    await page.waitForLoadState('networkidle')

    // Clear errors before critical test
    consoleErrors = []
    networkFailures = []

    await switchWorkspace(page, 'E2E Test Workspace 2')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/automations')
    expectNoErrors()
  })

  test('should switch workspace from Assistants page without errors', async ({ page }) => {
    await page.getByRole('tab', { name: /assistants/i }).click()
    await page.waitForLoadState('networkidle')

    await switchWorkspace(page, 'E2E Test Workspace 1')
    await expect(page.getByText('E2E Test Assistant - WS1')).toBeVisible()

    await switchWorkspace(page, 'E2E Test Workspace 2')
    await expect(page.getByText('E2E Test Assistant - WS2')).toBeVisible()

    expectNoErrors()
  })

  test('should handle rapid workspace switching without errors', async ({ page }) => {
    await switchWorkspace(page, 'E2E Test Workspace 1')
    await switchWorkspace(page, 'E2E Test Workspace 2')
    await switchWorkspace(page, 'E2E Test Workspace 1')
    await switchWorkspace(page, 'E2E Test Workspace 2')

    const switcher = workspaceSwitcher(page)
    await expect(switcher.locator('summary')).toContainText('E2E Test Workspace 2')

    expectNoErrors()
  })
})
