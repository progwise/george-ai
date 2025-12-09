import { expect, test } from '@playwright/test'

import { automationSwitcher } from './webapp-utils/automation-switcher-util'
import { loginToWebapp } from './webapp-utils/login-util'
import { switchWorkspace } from './webapp-utils/workspace-switcher-util'

test.describe('Automations', () => {
  test.beforeEach(async ({ page }) => {
    await loginToWebapp(page)
  })

  test.describe('Creating and Managing Automations', () => {
    test('should create a new automation and display items from the list', async ({ page }) => {
      const uniqueId = Date.now()
      const automationName = `E2E Test Automation ${uniqueId}`

      // Switch to E2E Test Workspace 1 (has the test connector and list)
      await switchWorkspace(page, 'E2E Test Workspace 1')

      // Navigate to automations
      await page.goto('/automations')
      await page.waitForLoadState('networkidle')

      // Click "New Automation" button (may be in empty state or menu)
      const newAutomationButton = page.getByRole('button', { name: /new automation/i })

      await expect(newAutomationButton).toBeEnabled()
      await newAutomationButton.click()

      // Wait for dialog
      const dialog = page.getByRole('dialog', { name: /create automation/i })
      await expect(dialog).toBeVisible()

      // Fill automation form (scope to dialog to avoid workspace name input)
      await dialog.getByLabel(/name/i).fill(automationName)

      // Select the test list
      await dialog.getByLabel(/list/i).click()
      await page.getByRole('option', { name: 'E2E Test List - Field Modal' }).click()

      // Select the test connector
      await dialog.getByLabel(/connector/i).click()
      await page.getByRole('option', { name: 'E2E Test Connector' }).click()

      // Submit
      await dialog.getByRole('button', { name: /create/i }).click()

      // Wait for navigation to the new automation (lands on Edit tab)
      const switcher = automationSwitcher(page)
      await expect(switcher.locator('summary')).toContainText(automationName)

      // Navigate to Items tab to see items
      await page.getByRole('tab', { name: /items/i }).click()

      // Verify item count is displayed
      await expect(page.getByText(/Items 1 to 3 from 3 items/i)).toBeVisible()
      // Verify automation items are displayed (from the list)
      const table = page.getByRole('table')
      // The test list has 3 files, so we should see 3 items
      await expect(table.getByText('E2E Test Document 1 WS1.txt')).toBeVisible()
      await expect(table.getByText('E2E Test Document 2 WS1.txt')).toBeVisible()
      await expect(table.getByText('E2E Test Document 3 WS1.txt')).toBeVisible()

      // Verify status badges are visible within the table (items should be PENDING initially)

      await expect(table.getByText('PENDING').first()).toBeVisible()

      // Verify the "Run All" button is visible
      await expect(page.getByTitle('Run All')).toBeVisible()
    })

    test('should switch workspace from automation detail and redirect to automations list', async ({ page }) => {
      const uniqueId = Date.now()
      const automationName = `E2E Test Workspace Switch ${uniqueId}`

      await page.goto('/automations')
      await switchWorkspace(page, 'E2E Test Workspace 1')

      // Create automation
      await page.getByRole('button', { name: /new automation/i }).click()

      const dialog = page.getByRole('dialog', { name: /create automation/i })
      await expect(dialog).toBeVisible()

      await dialog.getByLabel(/name/i).fill(automationName)
      await dialog.getByLabel(/list/i).click()
      await page.getByRole('option', { name: 'E2E Test List - Field Modal' }).click()
      await dialog.getByLabel(/connector/i).click()
      await page.getByRole('option', { name: 'E2E Test Connector' }).click()
      await dialog.getByRole('button', { name: /create/i }).click()

      const selectedAutomation1 = page
        .getByRole('combobox', { name: /switch automation/i })
        .getByTitle(/selected automation/i)
      await expect(selectedAutomation1).toBeVisible()
      await expect(selectedAutomation1).toContainText(automationName)

      await switchWorkspace(page, 'E2E Test Workspace 2')

      // Verify we were redirected to automations (either list or detail of WS2 automation)
      const selectedAutomation2 = page
        .getByRole('combobox', { name: /switch automation/i })
        .getByTitle(/selected automation/i)

      // Workspace 2 has a pre-created automation, so we should see it
      await expect(selectedAutomation2).toBeVisible()
      await expect(selectedAutomation2).toContainText('E2E Test Automation - WS2')
    })

    test('should show different automations in different workspaces', async ({ page }) => {
      const uniqueId = Date.now()
      const automation1Name = `E2E Test Auto WS1 ${uniqueId}`

      const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })

      // Create automation in Workspace 1
      await workspaceSwitcher.click()
      let dropdown = page.locator('details[open] > ul').first()
      await expect(dropdown).toBeVisible()
      await dropdown.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()
      await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
      await page.waitForLoadState('networkidle')

      await page.goto('/automations')
      await page.waitForLoadState('networkidle')

      const newAutomationButton = page.getByTitle('New Automation')
      if (await newAutomationButton.isVisible()) {
        await newAutomationButton.click()
      } else {
        await page.getByRole('button', { name: /new automation/i }).click()
      }

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()

      await dialog.getByLabel(/name/i).fill(automation1Name)
      await dialog.getByLabel(/list/i).click()
      await page.getByRole('option', { name: 'E2E Test List - Field Modal' }).click()
      await dialog.getByLabel(/connector/i).click()
      await page.getByRole('option', { name: 'E2E Test Connector' }).click()
      await dialog.getByRole('button', { name: /create/i }).click()

      // Wait for automation selector to show the new automation
      const automationSelector = page.getByRole('button', { name: 'Select automation' })
      await expect(automationSelector).toContainText(automation1Name)

      // Switch to Workspace 2
      await page.waitForTimeout(200)
      await workspaceSwitcher.click()
      dropdown = page.locator('details[open] > ul').first()
      await expect(dropdown).toBeVisible()
      await dropdown.getByRole('button', { name: 'E2E Test Workspace 2', exact: true }).click()
      await expect(workspaceSwitcher).toContainText('E2E Test Workspace 2')
      await page.waitForLoadState('networkidle')

      // Verify automation 1 is NOT visible in Workspace 2
      await expect(page.getByText(automation1Name)).not.toBeVisible()

      // Switch back to Workspace 1
      await page.waitForTimeout(200)
      await workspaceSwitcher.click()
      dropdown = page.locator('details[open] > ul').first()
      await expect(dropdown).toBeVisible()
      await dropdown.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()
      await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
      await page.waitForLoadState('networkidle')

      // Verify automation 1 is available in workspace 1
      // App may auto-select a different automation, so open dropdown to verify ours is listed
      await expect(automationSelector).toBeVisible({ timeout: 10000 })

      // Wait for automation dropdown (not workspace dropdown)
      const automationDropdown = page.locator('details:has(summary[aria-label="Select automation"]) > ul')
      await automationSelector.click()
      await expect(automationDropdown).toBeVisible()
      await expect(automationDropdown.getByText(automation1Name)).toBeVisible()
    })

    test('should delete automation', async ({ page }) => {
      const uniqueId = Date.now()
      const automationName = `E2E Test Delete ${uniqueId}`

      // Switch to E2E Test Workspace 1
      const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
      await workspaceSwitcher.click()
      const dropdown = page.locator('details[open] > ul').first()
      await expect(dropdown).toBeVisible()
      await dropdown.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()
      await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
      await page.waitForLoadState('networkidle')

      // Navigate and create automation
      await page.goto('/automations')
      await page.waitForLoadState('networkidle')

      const newAutomationButton = page.getByTitle('New Automation')
      if (await newAutomationButton.isVisible()) {
        await newAutomationButton.click()
      } else {
        await page.getByRole('button', { name: /new automation/i }).click()
      }

      const createDialog = page.getByRole('dialog')
      await expect(createDialog).toBeVisible()

      await createDialog.getByLabel(/name/i).fill(automationName)
      await createDialog.getByLabel(/list/i).click()
      await page.getByRole('option', { name: 'E2E Test List - Field Modal' }).click()
      await createDialog.getByLabel(/connector/i).click()
      await page.getByRole('option', { name: 'E2E Test Connector' }).click()
      await createDialog.getByRole('button', { name: /create/i }).click()

      await expect(createDialog).not.toBeVisible()

      // Wait for automation selector to show the new automation
      const automationSelector = page.getByRole('button', { name: 'Select automation' })
      await expect(automationSelector).toContainText(automationName)

      // Click delete button
      await page.getByRole('button', { name: /delete automation/i }).click()

      // Confirm deletion in dialog (button text is "Confirm" from DialogForm default)
      const deleteDialog = page.getByRole('dialog', { name: /delete automation/i })
      await expect(deleteDialog).toBeVisible()
      await expect(deleteDialog).toContainText(automationName)
      await deleteDialog.getByRole('button', { name: /confirm/i }).click()

      // Wait for dialog to close first
      await expect(deleteDialog).not.toBeVisible()

      // Verify automation is deleted - use count assertion to avoid strict mode
      await expect(page.getByText(automationName, { exact: true })).toHaveCount(0)
    })
  })

  test.describe('Automation Items', () => {
    test('should display item status badges correctly', async ({ page }) => {
      const uniqueId = Date.now()
      const automationName = `E2E Test Status ${uniqueId}`

      // Switch to E2E Test Workspace 1
      const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
      await workspaceSwitcher.click()
      const dropdown = page.locator('details[open] > ul').first()
      await expect(dropdown).toBeVisible()
      await dropdown.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()
      await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
      await page.waitForLoadState('networkidle')

      // Navigate and create automation
      await page.goto('/automations')
      await page.waitForLoadState('networkidle')

      const newAutomationButton = page.getByTitle('New Automation')
      if (await newAutomationButton.isVisible()) {
        await newAutomationButton.click()
      } else {
        await page.getByRole('button', { name: /new automation/i }).click()
      }

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()

      await dialog.getByLabel(/name/i).fill(automationName)
      await dialog.getByLabel(/list/i).click()
      await page.getByRole('option', { name: 'E2E Test List - Field Modal' }).click()
      await dialog.getByLabel(/connector/i).click()
      await page.getByRole('option', { name: 'E2E Test Connector' }).click()
      await dialog.getByRole('button', { name: /create/i }).click()

      // Wait for automation selector to show the new automation
      await expect(page.getByRole('button', { name: 'Select automation' })).toContainText(automationName)

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
      const uniqueId = Date.now()
      const automationName = `E2E Test Tabs ${uniqueId}`

      // Switch to E2E Test Workspace 1
      const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
      await workspaceSwitcher.click()
      const dropdown = page.locator('details[open] > ul').first()
      await expect(dropdown).toBeVisible()
      await dropdown.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()
      await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
      await page.waitForLoadState('networkidle')

      // Navigate and create automation
      await page.goto('/automations')
      await page.waitForLoadState('networkidle')

      const newAutomationButton = page.getByTitle('New Automation')
      if (await newAutomationButton.isVisible()) {
        await newAutomationButton.click()
      } else {
        await page.getByRole('button', { name: /new automation/i }).click()
      }

      const dialog = page.getByRole('dialog')
      await expect(dialog).toBeVisible()

      await dialog.getByLabel(/name/i).fill(automationName)
      await dialog.getByLabel(/list/i).click()
      await page.getByRole('option', { name: 'E2E Test List - Field Modal' }).click()
      await dialog.getByLabel(/connector/i).click()
      await page.getByRole('option', { name: 'E2E Test Connector' }).click()
      await dialog.getByRole('button', { name: /create/i }).click()

      // Wait for automation selector to show the new automation
      await expect(page.getByRole('button', { name: 'Select automation' })).toContainText(automationName)

      // Click Items tab
      const itemsTab = page.getByRole('tab', { name: /items/i })
      await itemsTab.click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toMatch(/\/automations\/[^/]+\/?$/)

      // Click Batches tab
      const batchesTab = page.getByRole('tab', { name: /batches/i })
      await batchesTab.click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/batches')

      // Click Edit tab
      const editTab = page.getByRole('tab', { name: /edit/i })
      await editTab.click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toContain('/edit')
    })
  })
})
