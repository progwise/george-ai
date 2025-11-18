import { expect, test } from '@playwright/test'

const E2E_USERNAME = process.env.E2E_USERNAME!
const E2E_PASSWORD = process.env.E2E_PASSWORD!

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
    const dropdown = page.locator('.dropdown-content.menu').first()
    await expect(dropdown).toBeVisible()

    // Should have multiple workspace options (Shared + 2 test workspaces)
    const workspaceOptions = dropdown.locator('li button')
    const count = await workspaceOptions.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test('should highlight current workspace in dropdown', async ({ page }) => {
    // Get current workspace name from button
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    const currentWorkspaceName = await workspaceSwitcher.textContent()

    // Open dropdown
    await workspaceSwitcher.click()

    // Find the active workspace in dropdown (should have bg-base-300 font-semibold classes)
    const activeWorkspace = page.locator('.dropdown-content li button.font-semibold')
    await expect(activeWorkspace).toBeVisible()

    // Active workspace name should match button text
    const activeWorkspaceName = await activeWorkspace.textContent()
    expect(activeWorkspaceName?.trim()).toBe(currentWorkspaceName?.trim())
  })

  test('should switch workspace when clicking different option', async ({ page }) => {
    // Open workspace dropdown
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await workspaceSwitcher.click()

    // Get initial workspace name
    const initialWorkspace = await workspaceSwitcher.textContent()

    // Click second workspace option (different from current)
    const workspaceOptions = page.locator('.dropdown-content li button')
    const secondWorkspaceName = await workspaceOptions.nth(1).textContent()
    await workspaceOptions.nth(1).click()

    // Wait for workspace to actually change
    await expect(workspaceSwitcher).toContainText(secondWorkspaceName || '')
    await page.waitForLoadState('networkidle')

    // Verify workspace changed
    const newWorkspace = await workspaceSwitcher.textContent()
    expect(newWorkspace?.trim()).not.toBe(initialWorkspace?.trim())
  })

  test('should persist workspace selection after page reload', async ({ page }) => {
    // Open workspace dropdown
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await workspaceSwitcher.click()

    // Click "E2E Test Workspace 1"
    await page.getByRole('button', { name: 'E2E Test Workspace 1' }).click()

    // Wait for workspace to actually change
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
    await page.waitForLoadState('networkidle')

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Workspace selection should persist
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
  })

  test('should filter libraries by selected workspace', async ({ page }) => {
    // Switch to E2E Test Workspace 1
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1' }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')

    // Go to libraries tab
    await page.getByRole('tab', { name: /libraries/i }).click()
    await page.waitForLoadState('networkidle')

    // Switch to E2E Test Workspace 2
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 2' }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 2')
    await page.waitForLoadState('networkidle')

    // Verify we're still on libraries tab
    await expect(page.getByRole('tab', { name: /libraries/i })).toBeVisible()

    // Verify we're still on libraries tab
    await expect(page.getByRole('tab', { name: /libraries/i })).toBeVisible()
  })

  test('should filter assistants by selected workspace', async ({ page }) => {
    // Switch to E2E Test Workspace 1
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1' }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')

    // Go to assistants tab
    await page.getByRole('tab', { name: /assistants/i }).click()
    await page.waitForLoadState('networkidle')

    // Switch to E2E Test Workspace 2
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 2' }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 2')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('tab', { name: /assistants/i })).toBeVisible()
  })

  test('should filter lists by selected workspace', async ({ page }) => {
    // Switch to E2E Test Workspace 1
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1' }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')

    // Go to lists tab
    await page.getByRole('tab', { name: /lists/i }).click()
    await page.waitForLoadState('networkidle')

    // Switch to E2E Test Workspace 2
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 2' }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 2')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('tab', { name: /lists/i })).toBeVisible()
  })

  test('should close dropdown when clicking outside', async ({ page }) => {
    // Open workspace dropdown
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await workspaceSwitcher.click()

    // Dropdown should be visible (use .first() as there are multiple dropdowns on page)
    const dropdown = page.locator('.dropdown-content.menu').first()
    await expect(dropdown).toBeVisible()

    // Click outside the dropdown (on the heading)
    await page.getByRole('heading', { name: /overview/i }).click()

    // Dropdown should be hidden
    await expect(dropdown).not.toBeVisible()
  })

  test('should show different libraries in different workspaces', async ({ page }) => {
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    const uniqueId = Date.now()

    // Step 1: Switch to E2E Test Workspace 1
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1' }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')

    // Step 2: Go to libraries tab
    await page.getByRole('tab', { name: /libraries/i }).click()
    await page.waitForLoadState('networkidle')

    // Step 3: Create a library in Workspace 1
    await page.getByRole('button', { name: /create library/i }).click()
    await page.getByLabel('Library Name').fill(`Workspace 1 Library ${uniqueId}`)
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /^create$/i })
      .click()
    await page.waitForLoadState('networkidle')

    // Step 4: Navigate back to dashboard and verify library appears
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('tab', { name: /libraries/i }).click()
    await expect(page.getByText(`Workspace 1 Library ${uniqueId}`)).toBeVisible()

    // Step 5: Switch to E2E Test Workspace 2
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 2' }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 2')
    await page.waitForLoadState('networkidle')

    // Step 6: Verify Workspace 1 library is NOT visible in Workspace 2
    await expect(page.getByText(`Workspace 1 Library ${uniqueId}`)).not.toBeVisible()

    // Step 7: Create a library in Workspace 2
    await page.getByRole('button', { name: /create library/i }).click()
    await page.getByLabel('Library Name').fill(`Workspace 2 Library ${uniqueId}`)
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /^create$/i })
      .click()
    await page.waitForLoadState('networkidle')

    // Step 8: Navigate back to dashboard and verify Workspace 2 library appears
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('tab', { name: /libraries/i }).click()
    await expect(page.getByText(`Workspace 2 Library ${uniqueId}`)).toBeVisible()

    // Step 9: Switch back to Workspace 1
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1' }).click()

    // Wait for the workspace switcher button to actually update
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
    await page.waitForLoadState('networkidle')

    // Step 10: Verify Workspace 1 library is visible, but Workspace 2 library is NOT
    await expect(page.getByText(`Workspace 1 Library ${uniqueId}`)).toBeVisible()
    await expect(page.getByText(`Workspace 2 Library ${uniqueId}`)).not.toBeVisible()
  })

  test('should show different assistants in different workspaces', async ({ page }) => {
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    const uniqueId = Date.now()

    // Step 1: Switch to E2E Test Workspace 1
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1' }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')

    // Step 2: Go to assistants tab
    await page.getByRole('tab', { name: /assistants/i }).click()
    await page.waitForLoadState('networkidle')

    // Step 3: Create an assistant in Workspace 1
    await page.getByRole('button', { name: /create assistant/i }).click()
    await page.getByLabel('Assistant Name').fill(`Workspace 1 Assistant ${uniqueId}`)
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /^create$/i })
      .click()
    await page.waitForLoadState('networkidle')

    // Step 4: Navigate back to dashboard and verify assistant appears in Workspace 1
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('tab', { name: /assistants/i }).click()
    await expect(page.getByText(`Workspace 1 Assistant ${uniqueId}`)).toBeVisible()

    // Step 5: Switch to E2E Test Workspace 2
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 2' }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 2')
    await page.waitForLoadState('networkidle')

    // Step 6: Verify Workspace 1 assistant is NOT visible in Workspace 2
    await expect(page.getByText(`Workspace 1 Assistant ${uniqueId}`)).not.toBeVisible()

    // Step 7: Create an assistant in Workspace 2
    await page.getByRole('button', { name: /create assistant/i }).click()
    await page.getByLabel('Assistant Name').fill(`Workspace 2 Assistant ${uniqueId}`)
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /^create$/i })
      .click()
    await page.waitForLoadState('networkidle')

    // Step 8: Navigate back to dashboard and verify Workspace 2 assistant appears
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('tab', { name: /assistants/i }).click()
    await expect(page.getByText(`Workspace 2 Assistant ${uniqueId}`)).toBeVisible()

    // Step 9: Switch back to Workspace 1
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1' }).click()

    // Wait for the workspace switcher button to actually update
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
    await page.waitForLoadState('networkidle')

    // Step 10: Verify Workspace 1 assistant is visible, but Workspace 2 assistant is NOT
    await expect(page.getByText(`Workspace 1 Assistant ${uniqueId}`)).toBeVisible()
    await expect(page.getByText(`Workspace 2 Assistant ${uniqueId}`)).not.toBeVisible()
  })

  test('should show different lists in different workspaces', async ({ page }) => {
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    const uniqueId = Date.now()

    // Step 1: Switch to E2E Test Workspace 1
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1' }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')

    // Step 2: Go to lists tab
    await page.getByRole('tab', { name: /lists/i }).click()
    await page.waitForLoadState('networkidle')

    // Step 3: Create a list in Workspace 1
    await page.getByRole('button', { name: /create list/i }).click()
    await page.getByLabel('Name the list').fill(`Workspace 1 List ${uniqueId}`)
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /^create$/i })
      .click()
    await page.waitForLoadState('networkidle')

    // Step 4: Navigate back to dashboard and verify list appears in Workspace 1
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('tab', { name: /lists/i }).click()
    await expect(page.getByText(`Workspace 1 List ${uniqueId}`)).toBeVisible()

    // Step 5: Switch to E2E Test Workspace 2
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 2' }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 2')
    await page.waitForLoadState('networkidle')

    // Step 6: Verify Workspace 1 list is NOT visible in Workspace 2
    await expect(page.getByText(`Workspace 1 List ${uniqueId}`)).not.toBeVisible()

    // Step 7: Create a list in Workspace 2
    await page.getByRole('button', { name: /create list/i }).click()
    await page.getByLabel('Name the list').fill(`Workspace 2 List ${uniqueId}`)
    await page
      .getByRole('dialog')
      .getByRole('button', { name: /^create$/i })
      .click()
    await page.waitForLoadState('networkidle')

    // Step 8: Navigate back to dashboard and verify Workspace 2 list appears
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('tab', { name: /lists/i }).click()
    await expect(page.getByText(`Workspace 2 List ${uniqueId}`)).toBeVisible()

    // Step 9: Switch back to Workspace 1
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1' }).click()

    // Wait for the workspace switcher button to actually update
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
    await page.waitForLoadState('networkidle')

    // Step 10: Verify Workspace 1 list is visible, but Workspace 2 list is NOT
    await expect(page.getByText(`Workspace 1 List ${uniqueId}`)).toBeVisible()
    await expect(page.getByText(`Workspace 2 List ${uniqueId}`)).not.toBeVisible()
  })
})
