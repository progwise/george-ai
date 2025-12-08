import { expect, test } from '@playwright/test'

const E2E_USERNAME = process.env.E2E_USERNAME!
const E2E_PASSWORD = process.env.E2E_PASSWORD!

/**
 * Consolidated workspace switching tests.
 *
 * These tests verify that switching workspaces works correctly from various pages
 * without causing console errors, failed network requests, or crashes.
 *
 * Test data is created in global-setup.ts:
 * - E2E Test Workspace 1: Library, List, Automation, Assistant
 * - E2E Test Workspace 2: Library, List, Automation, Assistant
 */
test.describe('Workspace Switching - All Pages', () => {
  // Track console errors across tests
  let consoleErrors: string[] = []
  let networkFailures: string[] = []

  test.beforeEach(async ({ page }) => {
    // Reset error tracking for each test
    consoleErrors = []
    networkFailures = []

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
      if (process.env.CI || process.env.E2E_DEBUG) {
        console.log('BROWSER CONSOLE:', msg.type(), msg.text())
      }
    })

    page.on('pageerror', (error) => {
      consoleErrors.push(error.message)
      if (process.env.CI || process.env.E2E_DEBUG) {
        console.log('BROWSER ERROR:', error.message)
      }
    })

    page.on('requestfailed', (request) => {
      // Ignore expected failures (e.g., canceled requests during navigation)
      const failure = request.failure()?.errorText || 'unknown'
      if (!failure.includes('net::ERR_ABORTED')) {
        networkFailures.push(`${request.url()} - ${failure}`)
      }
      if (process.env.CI || process.env.E2E_DEBUG) {
        console.log('NETWORK FAILED:', request.url(), failure)
      }
    })

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
  })

  test.afterEach(async () => {
    // Log any errors that occurred during the test (for debugging)
    if (consoleErrors.length > 0) {
      console.log('Console errors during test:', consoleErrors)
    }
    if (networkFailures.length > 0) {
      console.log('Network failures during test:', networkFailures)
    }
  })

  /**
   * Helper to switch workspace and verify no errors
   */
  async function switchWorkspace(
    page: import('@playwright/test').Page,
    targetWorkspace: string,
    sourceWorkspace?: string,
  ) {
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })

    // If sourceWorkspace provided, ensure we're starting from the right workspace
    if (sourceWorkspace) {
      await workspaceSwitcher.click()
      const dropdown = page.locator('details[open] > ul').first()
      await expect(dropdown).toBeVisible()
      await dropdown.getByRole('button', { name: sourceWorkspace, exact: true }).click()
      await expect(workspaceSwitcher).toContainText(sourceWorkspace)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(200) // Wait for dropdown to close
    }

    // Switch to target workspace
    await workspaceSwitcher.click()
    const dropdown = page.locator('details[open] > ul').first()
    await expect(dropdown).toBeVisible()
    await dropdown.getByRole('button', { name: targetWorkspace, exact: true }).click()
    await expect(workspaceSwitcher).toContainText(targetWorkspace)
    await page.waitForLoadState('networkidle')
  }

  test('should switch workspace from Dashboard without errors', async ({ page }) => {
    // Start on dashboard (already there after login)
    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()

    // Switch from WS1 to WS2
    await switchWorkspace(page, 'E2E Test Workspace 2', 'E2E Test Workspace 1')

    // Verify still on dashboard
    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()

    // Switch back to WS1
    await switchWorkspace(page, 'E2E Test Workspace 1')

    // Verify no critical errors (some warnings may be acceptable)
    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('Warning') && !e.includes('DevTools') && !e.includes('favicon'),
    )
    expect(criticalErrors).toHaveLength(0)
    expect(networkFailures).toHaveLength(0)
  })

  test('should switch workspace from Libraries list without errors', async ({ page }) => {
    // Navigate to libraries
    await page.getByRole('tab', { name: /libraries/i }).click()
    await page.waitForLoadState('networkidle')

    // Ensure we're in WS1
    await switchWorkspace(page, 'E2E Test Workspace 1')

    // Verify we see WS1 library
    await expect(page.getByText('E2E Test Library - Field Modal')).toBeVisible()

    // Switch to WS2
    await switchWorkspace(page, 'E2E Test Workspace 2')

    // Verify we see WS2 library (not WS1)
    await expect(page.getByText('E2E Test Library - WS2')).toBeVisible()
    await expect(page.getByText('E2E Test Library - Field Modal')).not.toBeVisible()

    // Verify no errors
    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('Warning') && !e.includes('DevTools') && !e.includes('favicon'),
    )
    expect(criticalErrors).toHaveLength(0)
    expect(networkFailures).toHaveLength(0)
  })

  test('should switch workspace from Library detail page without errors', async ({ page }) => {
    // Navigate to libraries and select one
    await page.getByRole('tab', { name: /libraries/i }).click()
    await page.waitForLoadState('networkidle')

    // Ensure we're in WS1
    await switchWorkspace(page, 'E2E Test Workspace 1')

    // Click on the library to go to detail page
    await page.getByText('E2E Test Library - Field Modal').click()
    await page.waitForLoadState('networkidle')

    // Verify we're on library detail (should see Files tab or similar)
    await expect(page.url()).toContain('/libraries/')

    // Switch to WS2 while on library detail
    await switchWorkspace(page, 'E2E Test Workspace 2')

    // Should redirect to libraries list (not stay on old library detail)
    await page.waitForLoadState('networkidle')

    // Verify we see WS2 content
    await expect(page.getByText('E2E Test Library - WS2')).toBeVisible()

    // Verify no errors
    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('Warning') && !e.includes('DevTools') && !e.includes('favicon'),
    )
    expect(criticalErrors).toHaveLength(0)
    expect(networkFailures).toHaveLength(0)
  })

  test('should switch workspace from Lists page without errors', async ({ page }) => {
    // Navigate to lists
    await page.getByRole('tab', { name: /lists/i }).click()
    await page.waitForLoadState('networkidle')

    // Ensure we're in WS1
    await switchWorkspace(page, 'E2E Test Workspace 1')

    // Lists auto-redirect to first list, so we should be on list detail
    // Verify we see WS1 list content
    await expect(page.getByText('E2E Test List - Field Modal').first()).toBeVisible()

    // Switch to WS2
    await switchWorkspace(page, 'E2E Test Workspace 2')

    // Should now show WS2 list
    await expect(page.getByText('E2E Test List - WS2').first()).toBeVisible()
    await expect(page.getByText('E2E Test List - Field Modal').first()).not.toBeVisible()

    // Verify no errors
    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('Warning') && !e.includes('DevTools') && !e.includes('favicon'),
    )
    expect(criticalErrors).toHaveLength(0)
    expect(networkFailures).toHaveLength(0)
  })

  test('should switch workspace from Automations page without errors', async ({ page }) => {
    // Navigate to automations
    await page.goto('/automations')
    await page.waitForLoadState('networkidle')

    // Ensure we're in WS1
    await switchWorkspace(page, 'E2E Test Workspace 1')
    await page.waitForLoadState('networkidle')

    // Automations auto-redirect to first automation, verify we're on automations page
    const automationSelector = page.getByRole('button', { name: 'Select automation' })
    await expect(automationSelector).toBeVisible({ timeout: 10000 })
    expect(page.url()).toContain('/automations/')

    // Clear any previous errors before the critical switch test
    consoleErrors = []
    networkFailures = []

    // Switch to WS2 - this is the critical test for the synchronous navigation fix
    await switchWorkspace(page, 'E2E Test Workspace 2')
    await page.waitForLoadState('networkidle')

    // Should still be on automations page, showing WS2 automation
    await expect(automationSelector).toBeVisible({ timeout: 10000 })
    expect(page.url()).toContain('/automations/')

    // This is the key assertion - no 500 errors or other failures
    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('Warning') && !e.includes('DevTools') && !e.includes('favicon'),
    )
    expect(criticalErrors).toHaveLength(0)
    expect(networkFailures).toHaveLength(0)
  })

  test('should switch workspace from Assistants page without errors', async ({ page }) => {
    // Navigate to assistants
    await page.getByRole('tab', { name: /assistants/i }).click()
    await page.waitForLoadState('networkidle')

    // Ensure we're in WS1
    await switchWorkspace(page, 'E2E Test Workspace 1')

    // Verify we see WS1 assistant
    await expect(page.getByText('E2E Test Assistant - WS1')).toBeVisible()

    // Switch to WS2
    await switchWorkspace(page, 'E2E Test Workspace 2')

    // Should now show WS2 assistant
    await expect(page.getByText('E2E Test Assistant - WS2')).toBeVisible()
    await expect(page.getByText('E2E Test Assistant - WS1')).not.toBeVisible()

    // Verify no errors
    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('Warning') && !e.includes('DevTools') && !e.includes('favicon'),
    )
    expect(criticalErrors).toHaveLength(0)
    expect(networkFailures).toHaveLength(0)
  })

  test('should switch workspace from Conversations page without errors', async ({ page }) => {
    // Navigate to conversations (don't use networkidle - page may have websockets)
    await page.goto('/conversations')
    await page.waitForLoadState('load')

    // Ensure we're in WS1
    await switchWorkspace(page, 'E2E Test Workspace 1')

    // Conversations page may be empty or have content - just verify no errors on switch
    // Switch to WS2
    await switchWorkspace(page, 'E2E Test Workspace 2')

    // Verify still on conversations page
    expect(page.url()).toContain('/conversations')

    // Verify no errors
    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('Warning') && !e.includes('DevTools') && !e.includes('favicon'),
    )
    expect(criticalErrors).toHaveLength(0)
    expect(networkFailures).toHaveLength(0)
  })

  test('should handle rapid workspace switching without errors', async ({ page }) => {
    // Start on dashboard
    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()

    // Rapid switch between workspaces
    await switchWorkspace(page, 'E2E Test Workspace 1')
    await switchWorkspace(page, 'E2E Test Workspace 2')
    await switchWorkspace(page, 'E2E Test Workspace 1')
    await switchWorkspace(page, 'E2E Test Workspace 2')

    // Verify final state
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 2')

    // Verify no errors from rapid switching
    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('Warning') && !e.includes('DevTools') && !e.includes('favicon'),
    )
    expect(criticalErrors).toHaveLength(0)
    expect(networkFailures).toHaveLength(0)
  })
})
