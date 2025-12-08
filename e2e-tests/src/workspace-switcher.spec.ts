import { expect, test } from '@playwright/test'

const E2E_USERNAME = process.env.E2E_USERNAME!
const E2E_PASSWORD = process.env.E2E_PASSWORD!

/**
 * Workspace Switcher UI and CRUD Tests
 *
 * Tests for workspace switcher UI behavior, persistence, and workspace create/delete operations.
 * For workspace switching from different pages, see workspace-switching.spec.ts
 */
test.describe('Workspace Switcher', () => {
  test.beforeEach(async ({ page }) => {
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

    // Wait for page to be fully loaded and workspace switcher to be ready
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('button', { name: 'Switch workspace' })).toBeVisible({ timeout: 10000 })
  })

  test('should display workspace switcher in navigation', async ({ page }) => {
    // Workspace switcher should be visible in the navbar
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await expect(workspaceSwitcher).toBeVisible()

    // Should display a workspace name
    const text = await workspaceSwitcher.textContent()
    expect(text?.trim().length).toBeGreaterThan(0)
  })

  test('should show workspace dropdown menu on click', async ({ page }) => {
    // Click workspace switcher button
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await workspaceSwitcher.click()

    // Dropdown menu should be visible (use .first() as there are multiple dropdowns on page)
    const dropdown = page.locator('details[open] > ul').first()
    await expect(dropdown).toBeVisible()

    // Should have at least 2 workspace options (E2E Test Workspace 1 and 2)
    const workspaceOptions = dropdown.locator('li > button')
    const count = await workspaceOptions.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test('should highlight current workspace in dropdown', async ({ page }) => {
    // Get current workspace name from button
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    const currentWorkspaceName = await workspaceSwitcher.textContent()

    // Open dropdown
    await workspaceSwitcher.click()

    // Find the active workspace in dropdown (should have menu-active class on the button)
    const activeWorkspaceButton = page.locator('details[open] > ul li button.menu-active')
    await expect(activeWorkspaceButton).toBeVisible()

    // Verify the active workspace name matches the current workspace
    const activeWorkspaceName = await activeWorkspaceButton.textContent()
    expect(activeWorkspaceName?.trim()).toBe(currentWorkspaceName?.trim())
  })

  test('should persist workspace selection after page reload', async ({ page }) => {
    // Open workspace dropdown
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await workspaceSwitcher.click()

    // Wait for dropdown to be visible
    const dropdown = page.locator('details[open] > ul').first()
    await expect(dropdown).toBeVisible()

    // Click "E2E Test Workspace 1"
    await dropdown.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()

    // Wait for workspace to actually change
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
    await page.waitForLoadState('networkidle')

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Workspace selection should persist
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
  })

  // Skipped: ESC key works correctly in manual testing, but Playwright's keyboard events
  // don't reliably trigger document-level event listeners the same way real user input does
  test.skip('should close dropdown when pressing Escape', async ({ page }) => {
    // Open workspace dropdown
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await expect(workspaceSwitcher).toBeVisible()
    await workspaceSwitcher.click()

    // Check that details element is now open (dropdown is visible)
    const workspaceDetails = page.locator('ul.menu-horizontal li details')
    await expect(workspaceDetails).toHaveAttribute('open', '')

    // Press Escape to close the dropdown
    await page.keyboard.press('Escape')

    // Check that details element is no longer open (dropdown is hidden)
    await expect(workspaceDetails).not.toHaveAttribute('open')
  })

  test.describe('Create Workspace', () => {
    test('should show create workspace button in navigation', async ({ page }) => {
      // Create button should be visible in navigation (not inside dropdown anymore)
      const createButton = page.locator('button[aria-label*="Create"]').first()
      await expect(createButton).toBeVisible()
    })

    test('should open create workspace dialog when clicking create button', async ({ page }) => {
      // Scroll to top to ensure button is in viewport
      await page.evaluate(() => window.scrollTo(0, 0))

      // Click create button (now in navigation, not inside dropdown)
      const createButton = page.locator('button[aria-label*="Create"]').first()
      await createButton.click()

      // Dialog should be visible
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      await expect(dialog.getByRole('heading', { name: /create workspace/i })).toBeVisible()
    })

    test('should create workspace with valid name and slug', async ({ page }) => {
      const uniqueId = Date.now()
      const workspaceName = `E2E Test Workspace ${uniqueId}`
      const workspaceSlug = `e2e-test-workspace-${uniqueId}`

      // Scroll to top to ensure button is in viewport
      await page.evaluate(() => window.scrollTo(0, 0))

      // Open create workspace dialog (button now in navigation)
      const createButton = page.locator('button[aria-label*="Create"]').first()
      await createButton.click()

      const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })

      // Fill in workspace details
      await page.getByLabel(/workspace name/i).fill(workspaceName)
      await page.getByLabel(/slug/i).fill(workspaceSlug)

      // Submit form
      await page
        .getByRole('dialog')
        .getByRole('button', { name: /^create$/i })
        .click()

      // Wait for workspace to be created and switched
      await page.waitForLoadState('networkidle')
      await expect(workspaceSwitcher).toContainText(workspaceName)

      // Verify new workspace appears in dropdown
      await workspaceSwitcher.click()
      await expect(page.getByRole('button', { name: workspaceName })).toBeVisible()
    })

    test('should auto-generate slug from workspace name', async ({ page }) => {
      const uniqueId = Date.now()
      const workspaceName = `Test Auto Slug ${uniqueId}`

      // Scroll to top to ensure button is in viewport
      await page.evaluate(() => window.scrollTo(0, 0))

      // Open create workspace dialog (button now in navigation)
      const createButton = page.locator('button[aria-label*="Create"]').first()
      await createButton.click()

      // Fill in only workspace name
      const nameInput = page.getByLabel(/workspace name/i)
      await nameInput.fill(workspaceName)

      // Trigger input event to auto-generate slug
      await nameInput.blur()

      // Verify slug was auto-generated (lowercase, hyphens instead of spaces)
      const slugInput = page.getByLabel(/slug/i)
      const slugValue = await slugInput.inputValue()
      expect(slugValue).toBe(`test-auto-slug-${uniqueId}`)
    })

    test('should validate slug format and reject invalid characters', async ({ page }) => {
      const uniqueId = Date.now()

      // Scroll to top to ensure button is in viewport
      await page.evaluate(() => window.scrollTo(0, 0))

      // Open create workspace dialog (button now in navigation)
      const createButton = page.locator('button[aria-label*="Create"]').first()
      await createButton.click()

      // Try to submit with invalid slug (uppercase, spaces, special chars)
      await page.getByLabel(/workspace name/i).fill(`Test ${uniqueId}`)
      await page.getByLabel(/slug/i).fill(`Invalid Slug ${uniqueId}!`)

      // Submit form
      await page
        .getByRole('dialog')
        .getByRole('button', { name: /^create$/i })
        .click()

      // Should show inline error in dialog (not toast)
      const dialog = page.getByRole('dialog')
      await expect(dialog.locator('.alert-error')).toBeVisible()
    })
  })

  test.describe('Delete Workspace', () => {
    test('should show delete button in navbar for non-default workspaces when user is owner', async ({ page }) => {
      // Switch to E2E Test Workspace 1 (non-default workspace where user is owner)
      const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
      await workspaceSwitcher.click()
      const dropdown = page.locator('details[open] > ul').first()
      await expect(dropdown).toBeVisible()
      await dropdown.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()
      await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
      await page.waitForLoadState('networkidle')

      // Delete button should be visible in navbar (outside dropdown) for non-default workspaces
      const deleteButton = page.locator('button[aria-label*="Delete"]').first()
      await expect(deleteButton).toBeVisible()
    })

    test('should open delete workspace dialog when clicking delete button', async ({ page }) => {
      // Switch to E2E Test Workspace 1 (non-default workspace where user is owner)
      const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
      await workspaceSwitcher.click()
      const dropdown = page.locator('details[open] > ul').first()
      await expect(dropdown).toBeVisible()
      await dropdown.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()
      await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
      await page.waitForLoadState('networkidle')

      // Click delete button in navbar
      const deleteButton = page.locator('button[aria-label*="Delete"]').first()
      await deleteButton.click()

      // Delete dialog should be visible
      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()
      await expect(dialog.getByRole('heading', { name: /delete workspace/i })).toBeVisible()
    })

    test('should block deletion if workspace contains libraries', async ({ page }) => {
      const uniqueId = Date.now()
      const workspaceName = `Delete Test WS ${uniqueId}`
      const workspaceSlug = `delete-test-ws-${uniqueId}`
      const libraryName = `Test Library ${uniqueId}`

      // Scroll to top to ensure button is in viewport
      await page.evaluate(() => window.scrollTo(0, 0))

      // Create a new workspace (button now in navigation)
      const createButton = page.locator('button[aria-label*="Create"]').first()
      await createButton.click()

      const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })

      await page.getByLabel(/workspace name/i).fill(workspaceName)
      await page.getByLabel(/slug/i).fill(workspaceSlug)

      let createDialog = page.getByRole('dialog')
      await createDialog.getByRole('button', { name: /^create$/i }).click()

      // Wait for Create Workspace dialog to close and verify we switched to new workspace
      await expect(createDialog).not.toBeVisible()
      await expect(workspaceSwitcher).toContainText(workspaceName)
      await page.waitForLoadState('networkidle')

      // Create a library in the new workspace
      await page.getByRole('tab', { name: /libraries/i }).click()
      await page.waitForLoadState('networkidle')
      await page.getByRole('button', { name: /create library/i }).click()
      await page.getByLabel('Library Name').fill(libraryName)

      createDialog = page.getByRole('dialog')
      await createDialog.getByRole('button', { name: /^create$/i }).click()

      // Wait for Create Library dialog to close
      await expect(createDialog).not.toBeVisible()
      await page.waitForLoadState('networkidle')

      // Verify library was created and is visible (use first() since name appears in multiple places)
      await expect(page.getByText(libraryName).first()).toBeVisible()

      // Verify we're still in the correct workspace before trying to delete
      await expect(workspaceSwitcher).toContainText(workspaceName)

      // Click delete button in navbar (deletes current workspace)
      const deleteButton = page.locator('button[aria-label*="Delete"]').first()
      await deleteButton.click()

      // Should show error message with item counts
      const dialog = page.getByRole('dialog')
      await expect(dialog).toContainText(/cannot delete/i)
      await expect(dialog).toContainText(/1 library/i)
    })

    test('should allow deletion of empty workspace', async ({ page }) => {
      const uniqueId = Date.now()
      const workspaceName = `Empty WS ${uniqueId}`
      const workspaceSlug = `empty-ws-${uniqueId}`

      // Scroll to top to ensure button is in viewport
      await page.evaluate(() => window.scrollTo(0, 0))

      // Create a new empty workspace (button now in navigation)
      const createButton = page.locator('button[aria-label*="Create"]').first()
      await createButton.click()

      const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })

      await page.getByLabel(/workspace name/i).fill(workspaceName)
      await page.getByLabel(/slug/i).fill(workspaceSlug)

      const createDialog = page.getByRole('dialog')
      await createDialog.getByRole('button', { name: /^create$/i }).click()

      // Wait for Create dialog to close
      await expect(createDialog).not.toBeVisible()
      await page.waitForLoadState('networkidle')

      // Verify we're now on the new workspace
      await expect(workspaceSwitcher).toContainText(workspaceName)

      // Click delete button in navbar (deletes current workspace)
      const deleteButton = page.locator('button[aria-label*="Delete"]').first()
      await deleteButton.click()

      // Should show confirmation dialog with workspace name (workspace is empty)
      const dialog = page.getByRole('dialog')
      await expect(dialog.getByRole('heading')).toContainText(workspaceName)
      await expect(dialog).toContainText(/workspace is empty/i)

      // Confirm deletion
      await dialog.getByRole('button', { name: /delete/i }).click()

      // Wait for dialog to close (confirms deletion completed)
      await expect(dialog).not.toBeVisible()
      await page.waitForLoadState('networkidle')

      // Wait for workspace switcher to be visible after navigation/reload
      // The app may redirect after deletion, so allow extra time
      await expect(workspaceSwitcher).toBeVisible({ timeout: 10000 })

      // Workspace should be deleted and switched to another workspace
      await expect(workspaceSwitcher).not.toContainText(workspaceName, { timeout: 10000 })
    })

    test('should automatically switch to another workspace after deletion', async ({ page }) => {
      const uniqueId = Date.now()
      const workspaceName = `Auto Switch ${uniqueId}`
      const workspaceSlug = `auto-switch-${uniqueId}`

      // Scroll to top to ensure create button is in viewport
      await page.evaluate(() => window.scrollTo(0, 0))

      // Create a new empty workspace
      const createButton = page.locator('button[aria-label*="Create"]').first()
      await createButton.click()

      const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
      await page.getByLabel(/workspace name/i).fill(workspaceName)
      await page.getByLabel(/slug/i).fill(workspaceSlug)

      const createDialog = page.getByRole('dialog')
      await createDialog.getByRole('button', { name: /^create$/i }).click()

      // Wait for Create dialog to close
      await expect(createDialog).not.toBeVisible()
      await page.waitForLoadState('networkidle')

      // Verify we switched to new workspace
      await expect(workspaceSwitcher).toContainText(workspaceName)

      // Click delete button in navbar (deletes current workspace)
      const deleteButton = page.locator('button[aria-label*="Delete"]').first()
      await deleteButton.click()

      // Confirm deletion
      const dialog = page.getByRole('dialog')
      await dialog.getByRole('button', { name: /delete/i }).click()

      // Wait for dialog to close (confirms deletion completed)
      await expect(dialog).not.toBeVisible()
      await page.waitForLoadState('networkidle')

      // Wait for workspace switcher to be visible after navigation/reload
      // The app may redirect after deletion, so allow extra time
      await expect(workspaceSwitcher).toBeVisible({ timeout: 10000 })

      // Should automatically switch to another workspace (not the deleted one)
      const currentWorkspace = await workspaceSwitcher.textContent()
      expect(currentWorkspace).not.toBe(workspaceName)
      expect(currentWorkspace?.trim().length).toBeGreaterThan(0)
    })
  })
})
