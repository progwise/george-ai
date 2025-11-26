import { expect, test } from '@playwright/test'

const E2E_USERNAME = process.env.E2E_USERNAME!
const E2E_PASSWORD = process.env.E2E_PASSWORD!

/**
 * E2E test for default workspace selection after login
 *
 * IMPORTANT: The test user is created in global-setup.ts with:
 * - defaultWorkspaceId: '00000000-0000-0000-0000-000000000001' (Shared workspace)
 *
 * This test verifies that after login, users land in their default workspace,
 * NOT in the first workspace alphabetically.
 *
 * The E2E test workspaces are:
 * - E2E Test Workspace 1 (alphabetically first)
 * - E2E Test Workspace 2
 * - Shared (should be default)
 */

test.describe('Default Workspace Selection', () => {
  test('should load default workspace (Shared) after login, not first alphabetically', async ({ page, context }) => {
    // Clear all browser state to ensure completely fresh session
    await context.clearCookies()
    await context.clearPermissions()

    // Navigate to page BEFORE clearing storage
    await page.goto('/')

    // Clear all storage types
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
      // Clear all cookies via JavaScript as well
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
      })
    })

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

    // CRITICAL ASSERTION: Verify the workspace switcher shows "Shared" workspace
    // NOT "E2E Test Workspace 1" (which would be first alphabetically)
    const workspaceSwitcher = page.getByRole('button', { name: /switch workspace/i })
    await expect(workspaceSwitcher).toBeVisible()

    // The workspace switcher should contain the default workspace name
    await expect(workspaceSwitcher).toContainText('Shared')

    // It should NOT contain "E2E Test Workspace 1"
    await expect(workspaceSwitcher).not.toContainText('E2E Test Workspace 1')

    // Additional verification: Check the workspace cookie
    const cookies = await context.cookies()
    const workspaceCookie = cookies.find((c) => c.name === 'workspace-id')

    if (workspaceCookie) {
      console.log('Workspace cookie value:', workspaceCookie.value)
      // The cookie should be the Shared workspace ID
      expect(workspaceCookie.value).toBe('00000000-0000-0000-0000-000000000001')
    } else {
      console.log('No workspace cookie found - this might indicate a bug')
    }
  })

  test('should remember selected workspace after navigation', async ({ page, context }) => {
    // Clear all browser state
    await context.clearCookies()
    await context.clearPermissions()

    await page.goto('/')

    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
      })
    })

    // Login
    await page.goto('/')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await page.getByRole('textbox', { name: 'Username or email' }).fill(E2E_USERNAME)
    await page.getByRole('textbox', { name: 'Password' }).fill(E2E_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()
    await page.waitForLoadState('networkidle')

    // Verify starting in Shared workspace
    await expect(page.getByRole('button', { name: /switch workspace/i })).toContainText('Shared')

    // Switch to E2E Test Workspace 1
    await page.getByRole('button', { name: /switch workspace/i }).click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()
    await expect(page.getByRole('button', { name: /switch workspace/i })).toContainText('E2E Test Workspace 1')
    await page.waitForLoadState('networkidle')

    // Navigate to another page (e.g., libraries)
    await page.goto('/libraries')
    await page.waitForLoadState('networkidle')

    // Verify still in E2E Test Workspace 1 (workspace persisted)
    await expect(page.getByRole('button', { name: /switch workspace/i })).toContainText('E2E Test Workspace 1')

    // Navigate to overview
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verify STILL in E2E Test Workspace 1 (workspace persisted across navigation)
    await expect(page.getByRole('button', { name: /switch workspace/i })).toContainText('E2E Test Workspace 1')
  })

  test('should load default workspace on fresh login after logout', async ({ page, context }) => {
    // Clear all browser state
    await context.clearCookies()
    await context.clearPermissions()

    await page.goto('/')

    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
      })
    })

    // Login
    await page.goto('/')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await page.getByRole('textbox', { name: 'Username or email' }).fill(E2E_USERNAME)
    await page.getByRole('textbox', { name: 'Password' }).fill(E2E_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()
    await page.waitForLoadState('networkidle')

    // Switch to E2E Test Workspace 1
    await page.getByRole('button', { name: /switch workspace/i }).click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()
    await expect(page.getByRole('button', { name: /switch workspace/i })).toContainText('E2E Test Workspace 1')
    await page.waitForLoadState('networkidle')

    // Logout (clear cookies to simulate logout)
    await context.clearCookies()
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
      })
    })

    // Login again
    await page.goto('/')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await page.getByRole('textbox', { name: 'Username or email' }).fill(E2E_USERNAME)
    await page.getByRole('textbox', { name: 'Password' }).fill(E2E_PASSWORD)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()
    await page.waitForLoadState('networkidle')

    // CRITICAL: After fresh login, should be back in default workspace (Shared)
    // NOT in the previously selected workspace (E2E Test Workspace 1)
    await expect(page.getByRole('button', { name: /switch workspace/i })).toContainText('Shared')
  })
})
