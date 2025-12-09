import { expect, test } from '@playwright/test'

import { automationSwitcher, createAutomation } from './webapp-utils/automation-util'
import { loginToWebapp } from './webapp-utils/login-util'
import { switchWorkspace } from './webapp-utils/workspace-switcher-util'

const TEST_LIST = 'E2E Test List - Field Modal'
const TEST_CONNECTOR = 'E2E Test Connector'

test.describe('Automations', () => {
  test.beforeEach(async ({ page }) => {
    await loginToWebapp(page)
  })

  test.describe('Creating and Managing Automations', () => {
    test('should create a new automation and display items from the list', async ({ page }) => {
      const automationName = `E2E Test Automation ${Date.now()}`

      await switchWorkspace(page, 'E2E Test Workspace 1')
      await createAutomation(page, { name: automationName, list: TEST_LIST, connector: TEST_CONNECTOR })

      // Navigate to Items tab to see items
      await page.getByRole('tab', { name: /items/i }).click()

      // Verify item count is displayed
      await expect(page.getByText(/Items 1 to 3 from 3 items/i)).toBeVisible()

      // Verify automation items are displayed (from the list)
      const table = page.getByRole('table')
      await expect(table.getByText('E2E Test Document 1 WS1.txt')).toBeVisible()
      await expect(table.getByText('E2E Test Document 2 WS1.txt')).toBeVisible()
      await expect(table.getByText('E2E Test Document 3 WS1.txt')).toBeVisible()

      // Verify status badges are visible within the table (items should be PENDING initially)
      await expect(table.getByText('PENDING').first()).toBeVisible()

      // Verify the "Run All" button is visible
      await expect(page.getByTitle('Run All')).toBeVisible()
    })

    test('should switch workspace from automation detail and redirect to automations list', async ({ page }) => {
      const automationName = `E2E Test Workspace Switch ${Date.now()}`

      await switchWorkspace(page, 'E2E Test Workspace 1')
      await createAutomation(page, { name: automationName, list: TEST_LIST, connector: TEST_CONNECTOR })

      // Switch to Workspace 2
      await switchWorkspace(page, 'E2E Test Workspace 2')

      // Verify we were redirected to automations (Workspace 2 has a pre-created automation)
      const switcher = automationSwitcher(page)
      await expect(switcher.locator('summary')).toContainText('E2E Test Automation - WS2')
    })

    test('should show different automations in different workspaces', async ({ page }) => {
      const automationName = `E2E Test Auto WS1 ${Date.now()}`

      await switchWorkspace(page, 'E2E Test Workspace 1')
      await createAutomation(page, { name: automationName, list: TEST_LIST, connector: TEST_CONNECTOR })

      // Switch to Workspace 2
      await switchWorkspace(page, 'E2E Test Workspace 2')

      // Verify automation is NOT visible in Workspace 2
      await expect(page.getByText(automationName)).not.toBeVisible()

      // Switch back to Workspace 1
      await switchWorkspace(page, 'E2E Test Workspace 1')

      // Verify automation is available in workspace 1
      // App may auto-select a different automation, so open dropdown to verify ours is listed
      const switcher = automationSwitcher(page)
      await expect(switcher).toBeVisible({ timeout: 10000 })
      await switcher.locator('summary').click()
      await expect(switcher.locator('ul')).toBeVisible()
      await expect(switcher.getByText(automationName)).toBeVisible()
    })

    test('should delete automation', async ({ page }) => {
      const automationName = `E2E Test Delete ${Date.now()}`

      await switchWorkspace(page, 'E2E Test Workspace 1')
      await createAutomation(page, { name: automationName, list: TEST_LIST, connector: TEST_CONNECTOR })

      // Click delete button
      await page.getByRole('button', { name: /delete automation/i }).click()

      // Confirm deletion in dialog
      const deleteDialog = page.getByRole('dialog', { name: /delete automation/i })
      await expect(deleteDialog).toBeVisible()
      await expect(deleteDialog).toContainText(automationName)
      await deleteDialog.getByRole('button', { name: /confirm/i }).click()

      // Wait for dialog to close
      await expect(deleteDialog).not.toBeVisible()

      // Verify automation is deleted
      await expect(page.getByText(automationName, { exact: true })).toHaveCount(0)
    })
  })

  test.describe('Automation Items', () => {
    test('should display item status badges correctly', async ({ page }) => {
      const automationName = `E2E Test Status ${Date.now()}`

      await switchWorkspace(page, 'E2E Test Workspace 1')
      await createAutomation(page, { name: automationName, list: TEST_LIST, connector: TEST_CONNECTOR })

      // Navigate to Items tab to see items
      await page.getByRole('tab', { name: /items/i }).click()
      await page.waitForLoadState('networkidle')

      // Verify items are displayed with status badges
      const table = page.getByRole('table')
      await expect(table).toBeVisible()

      // Verify items have run buttons (one per test document)
      const runButtons = page.getByTitle('Run Item')
      await expect(runButtons.first()).toBeVisible()
      const runButtonCount = await runButtons.count()
      expect(runButtonCount).toBe(3) // 3 test documents
    })

    test('should have working tabs (Items, Batches, Edit)', async ({ page }) => {
      const automationName = `E2E Test Tabs ${Date.now()}`

      await switchWorkspace(page, 'E2E Test Workspace 1')
      await createAutomation(page, { name: automationName, list: TEST_LIST, connector: TEST_CONNECTOR })

      // Click Items tab
      await page.getByRole('tab', { name: /items/i }).click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toMatch(/\/automations\/[^/]+\/?$/)

      // Click Batches tab
      await page.getByRole('tab', { name: /batches/i }).click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/batches')

      // Click Edit tab
      await page.getByRole('tab', { name: /edit/i }).click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/edit')
    })
  })
})
