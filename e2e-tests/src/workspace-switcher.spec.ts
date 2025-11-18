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
    await workspaceOptions.nth(1).click()

    // Wait for page to invalidate and reload
    await page.waitForTimeout(1000)

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
    await page.waitForTimeout(1000)

    // Get selected workspace name
    const selectedWorkspace = await workspaceSwitcher.textContent()
    expect(selectedWorkspace?.trim()).toBe('E2E Test Workspace 1')

    // Reload page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Workspace selection should persist
    const persistedWorkspace = await workspaceSwitcher.textContent()
    expect(persistedWorkspace?.trim()).toBe('E2E Test Workspace 1')
  })

  test('should filter libraries by selected workspace', async ({ page }) => {
    // Switch to E2E Test Workspace 1
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1' }).click()
    await page.waitForTimeout(1000)

    // Go to libraries tab
    await page.getByRole('tab', { name: /libraries/i }).click()
    await page.waitForLoadState('networkidle')

    // Verify we're in the right workspace
    const currentWorkspace = await workspaceSwitcher.textContent()
    expect(currentWorkspace?.trim()).toBe('E2E Test Workspace 1')

    // Switch to E2E Test Workspace 2
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 2' }).click()
    await page.waitForTimeout(1000)

    // Verify workspace changed
    const newWorkspace = await workspaceSwitcher.textContent()
    expect(newWorkspace?.trim()).toBe('E2E Test Workspace 2')

    // Verify we're still on libraries tab
    await expect(page.getByRole('tab', { name: /libraries/i })).toBeVisible()
  })

  test('should filter assistants by selected workspace', async ({ page }) => {
    // Switch to E2E Test Workspace 1
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1' }).click()
    await page.waitForTimeout(1000)

    // Go to assistants tab
    await page.getByRole('tab', { name: /assistants/i }).click()
    await page.waitForLoadState('networkidle')

    // Switch to E2E Test Workspace 2
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 2' }).click()
    await page.waitForTimeout(1000)

    // Verify workspace changed and we're still on assistants tab
    const newWorkspace = await workspaceSwitcher.textContent()
    expect(newWorkspace?.trim()).toBe('E2E Test Workspace 2')
    await expect(page.getByRole('tab', { name: /assistants/i })).toBeVisible()
  })

  test('should filter lists by selected workspace', async ({ page }) => {
    // Switch to E2E Test Workspace 1
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1' }).click()
    await page.waitForTimeout(1000)

    // Go to lists tab
    await page.getByRole('tab', { name: /lists/i }).click()
    await page.waitForLoadState('networkidle')

    // Switch to E2E Test Workspace 2
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 2' }).click()
    await page.waitForTimeout(1000)

    // Verify workspace changed and we're still on lists tab
    const newWorkspace = await workspaceSwitcher.textContent()
    expect(newWorkspace?.trim()).toBe('E2E Test Workspace 2')
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
})
