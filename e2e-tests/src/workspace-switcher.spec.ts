import { expect, test } from '@playwright/test'

import { loginToWebapp } from './webapp-utils/login-util'
import { switchWorkspace, workspaceSwitcher } from './webapp-utils/workspace-switcher-util'

/**
 * Workspace Switcher UI, CRUD, and Default Selection Tests
 *
 * Tests for:
 * - Workspace switcher UI behavior
 * - Create/delete workspace operations
 * - Default workspace selection after login
 * - Workspace persistence across navigation
 */
test.describe('Workspace Switcher', () => {
  test.beforeEach(async ({ page }) => {
    await loginToWebapp(page)
  })

  test.describe('UI Behavior', () => {
    test('should display workspace switcher with workspace name', async ({ page }) => {
      const switcher = workspaceSwitcher(page)
      await expect(switcher).toBeVisible()

      const summary = switcher.locator('summary')
      const text = await summary.textContent()
      expect(text?.trim().length).toBeGreaterThan(0)
    })

    test('should show dropdown with multiple workspaces on click', async ({ page }) => {
      const switcher = workspaceSwitcher(page)
      await switcher.locator('summary').click()

      const optionsList = switcher.getByRole('listbox')
      await expect(optionsList).toBeVisible()

      // Should have at least 2 workspace options (E2E Test Workspace 1 and 2)
      const options = optionsList.getByRole('option')
      const count = await options.count()
      expect(count).toBeGreaterThanOrEqual(2)
    })

    test('should highlight current workspace in dropdown', async ({ page }) => {
      await switchWorkspace(page, 'E2E Test Workspace 1')

      const switcher = workspaceSwitcher(page)
      await switcher.locator('summary').click()

      const optionsList = switcher.getByRole('listbox')
      await expect(optionsList).toBeVisible()

      // Active workspace should have aria-selected or similar indicator
      const activeOption = optionsList.getByRole('option', { name: 'E2E Test Workspace 1' })
      await expect(activeOption).toBeVisible()
    })

    test('should persist workspace selection after page reload', async ({ page }) => {
      await switchWorkspace(page, 'E2E Test Workspace 1')

      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')

      // Workspace selection should persist
      const switcher = workspaceSwitcher(page)
      await expect(switcher.locator('summary')).toContainText('E2E Test Workspace 1')
    })
  })

  test.describe('Create Workspace', () => {
    test('should show create workspace button in navigation', async ({ page }) => {
      const createButton = page.getByRole('button', { name: /create workspace/i })
      await expect(createButton).toBeVisible()
    })

    test('should create workspace with valid name and slug', async ({ page }) => {
      const uniqueId = Date.now()
      const workspaceName = `E2E New Workspace ${uniqueId}`
      const workspaceSlug = `e2e-new-workspace-${uniqueId}`

      // Open create workspace dialog
      await page.getByRole('button', { name: /create workspace/i }).click()

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()

      // Fill form
      await page.getByLabel(/workspace name/i).fill(workspaceName)
      await page.getByLabel(/slug/i).fill(workspaceSlug)

      // Submit
      await dialog.getByRole('button', { name: /create workspace/i }).click()

      // Verify switched to new workspace
      const switcher = workspaceSwitcher(page)
      await expect(switcher.locator('summary')).toContainText(workspaceName)
    })

    test('should auto-generate slug from workspace name', async ({ page }) => {
      const uniqueId = Date.now()
      const workspaceName = `Test Auto Slug ${uniqueId}`

      await page.getByRole('button', { name: /create workspace/i }).click()

      const nameInput = page.getByLabel(/workspace name/i)
      await nameInput.fill(workspaceName)
      await nameInput.blur()

      // Verify slug was auto-generated
      const slugInput = page.getByLabel(/slug/i)
      const slugValue = await slugInput.inputValue()
      expect(slugValue).toBe(`test-auto-slug-${uniqueId}`)
    })

    test('should validate slug format', async ({ page }) => {
      const uniqueId = Date.now()

      await page.getByRole('button', { name: /create workspace/i }).click()

      // Try invalid slug
      await page.getByLabel(/workspace name/i).fill(`Test ${uniqueId}`)
      await page.getByLabel(/slug/i).fill(`Invalid Slug ${uniqueId}!`)

      const dialog = page.getByRole('dialog')
      await dialog.getByRole('button', { name: /create workspace/i }).click()

      // Should show error
      await expect(dialog.locator('.alert-error')).toBeVisible()
    })
  })

  test.describe('Delete Workspace', () => {
    test('should show delete button for non-default workspaces', async ({ page }) => {
      await switchWorkspace(page, 'E2E Test Workspace 1')

      const deleteButton = page.getByRole('button', { name: /delete workspace/i })
      await expect(deleteButton).toBeVisible()
    })

    test('should block deletion if workspace contains libraries', async ({ page }) => {
      const uniqueId = Date.now()
      const workspaceName = `Delete Test WS ${uniqueId}`
      const workspaceSlug = `delete-test-ws-${uniqueId}`
      const libraryName = `Test Library ${uniqueId}`

      // Create workspace
      await page.getByRole('button', { name: /create workspace/i }).click()
      await page.getByLabel(/workspace name/i).fill(workspaceName)
      await page.getByLabel(/slug/i).fill(workspaceSlug)

      let dialog = page.getByRole('dialog')
      await dialog.getByRole('button', { name: /create workspace/i }).click()
      await expect(dialog).not.toBeVisible()

      // Create library in workspace
      await page.getByRole('tab', { name: /libraries/i }).click()
      await page.waitForLoadState('networkidle')
      await page.getByRole('button', { name: /create library/i }).click()
      await page.getByLabel('Library Name').fill(libraryName)

      dialog = page.getByRole('dialog')
      await dialog.getByRole('button', { name: /create library/i }).click()
      await expect(dialog).not.toBeVisible()
      await page.waitForLoadState('networkidle')

      // Try to delete workspace
      await page.getByRole('button', { name: /delete workspace/i }).click()

      dialog = page.getByRole('dialog')
      await expect(dialog).toContainText(/cannot delete/i)
      await expect(dialog).toContainText(/1 library/i)
    })

    test('should delete empty workspace and switch to another', async ({ page }) => {
      const uniqueId = Date.now()
      const workspaceName = `Empty WS ${uniqueId}`
      const workspaceSlug = `empty-ws-${uniqueId}`

      // Create empty workspace
      await page.getByRole('button', { name: /create workspace/i }).click()
      await page.getByLabel(/workspace name/i).fill(workspaceName)
      await page.getByLabel(/slug/i).fill(workspaceSlug)

      let dialog = page.getByRole('dialog')
      await dialog.getByRole('button', { name: /create workspace/i }).click()
      await expect(dialog).not.toBeVisible()
      await page.waitForLoadState('networkidle')

      // Verify we're in new workspace
      const switcher = workspaceSwitcher(page)
      await expect(switcher.locator('summary')).toContainText(workspaceName)

      // Delete workspace
      await page.getByRole('button', { name: /delete workspace/i }).click()

      dialog = page.getByRole('dialog')
      await expect(dialog).toContainText(/workspace is empty/i)
      await dialog.getByRole('button', { name: /delete/i }).click()

      await expect(dialog).not.toBeVisible()
      await page.waitForLoadState('networkidle')

      // Should switch to another workspace
      await expect(switcher.locator('summary')).not.toContainText(workspaceName)
    })
  })

  test.describe('Default Workspace Selection', () => {
    test('should load default workspace after fresh login', async ({ page, context }) => {
      // Clear session to simulate fresh login
      await context.clearCookies()
      await page.evaluate(() => {
        localStorage.clear()
        sessionStorage.clear()
      })

      // Login again
      await loginToWebapp(page)

      // Should be in default workspace (Shared), not first alphabetically
      const switcher = workspaceSwitcher(page)
      await expect(switcher.locator('summary')).toContainText('Shared')
      await expect(switcher.locator('summary')).not.toContainText('E2E Test Workspace 1')
    })

    test('should remember workspace after navigation', async ({ page }) => {
      await switchWorkspace(page, 'E2E Test Workspace 1')

      // Navigate to libraries
      await page.goto('/libraries')
      await page.waitForLoadState('networkidle')

      // Should still be in E2E Test Workspace 1
      const switcher = workspaceSwitcher(page)
      await expect(switcher.locator('summary')).toContainText('E2E Test Workspace 1')

      // Navigate to overview
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      // Should still be in E2E Test Workspace 1
      await expect(switcher.locator('summary')).toContainText('E2E Test Workspace 1')
    })
  })
})
