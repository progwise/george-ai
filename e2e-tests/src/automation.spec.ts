import { expect, test } from '@playwright/test'

const E2E_USERNAME = process.env.E2E_USERNAME!
const E2E_PASSWORD = process.env.E2E_PASSWORD!

test.describe('Automations', () => {
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
    await page.waitForLoadState('networkidle')
  })

  test.describe('Creating and Managing Automations', () => {
    test('should create a new automation and display items from the list', async ({ page }) => {
      const uniqueId = Date.now()
      const automationName = `E2E Test Automation ${uniqueId}`

      // Switch to E2E Test Workspace 1 (has the test connector and list)
      const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
      await workspaceSwitcher.click()
      const dropdown = page.locator('details[open] > ul').first()
      await expect(dropdown).toBeVisible()
      await dropdown.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()
      await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
      await page.waitForLoadState('networkidle')

      // Navigate to automations
      await page.goto('/automations')
      await page.waitForLoadState('networkidle')

      // Click "New Automation" button (may be in empty state or menu)
      const newAutomationButton = page.getByTitle('New Automation')
      if (await newAutomationButton.isVisible()) {
        await newAutomationButton.click()
      } else {
        // In empty state, the button has different structure
        await page.getByRole('button', { name: /new automation/i }).click()
      }

      // Wait for dialog
      const dialog = page.getByRole('dialog')
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

      // Wait for navigation to the new automation
      await page.waitForLoadState('networkidle')

      // Select our automation from the dropdown (in case another test created one simultaneously)
      const automationSelector = page.getByRole('button', { name: 'Select automation' })
      await automationSelector.click()
      const automationDropdown = page.locator('details[open] > ul').first()
      await expect(automationDropdown).toBeVisible()
      await automationDropdown.getByText(automationName).click()
      await page.waitForLoadState('networkidle')

      // Verify we're on the automation detail page with our automation selected
      await expect(automationSelector).toContainText(automationName)

      // Verify automation items are displayed (from the list)
      // The test list has 3 files, so we should see 3 items
      await expect(page.getByText('E2E Test Document 1.txt')).toBeVisible()
      await expect(page.getByText('E2E Test Document 2.txt')).toBeVisible()
      await expect(page.getByText('E2E Test Document 3.txt')).toBeVisible()

      // Verify item count is displayed
      await expect(page.getByText(/3 items/i)).toBeVisible()

      // Verify status badges are visible within the table (items should be PENDING initially)
      const table = page.locator('table')
      await expect(table.getByText('PENDING').first()).toBeVisible()

      // Verify the "Run All" button is visible
      await expect(page.getByTitle('Run All')).toBeVisible()
    })

    test('should switch workspace from automation detail and redirect to automations list', async ({ page }) => {
      const uniqueId = Date.now()
      const automationName = `E2E Test Workspace Switch ${uniqueId}`

      // Switch to E2E Test Workspace 1
      const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
      await workspaceSwitcher.click()
      let dropdown = page.locator('details[open] > ul').first()
      await expect(dropdown).toBeVisible()
      await dropdown.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()
      await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
      await page.waitForLoadState('networkidle')

      // Navigate to automations and create one
      await page.goto('/automations')
      await page.waitForLoadState('networkidle')

      // Create automation
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
      await page.waitForLoadState('networkidle')

      // Select our automation from the dropdown (in case another test created one simultaneously)
      const automationSelector = page.getByRole('button', { name: 'Select automation' })
      await automationSelector.click()
      const automationDropdown = page.locator('details[open] > ul').first()
      await expect(automationDropdown).toBeVisible()
      await automationDropdown.getByText(automationName).click()
      await page.waitForLoadState('networkidle')

      // Verify we're on the automation detail page with our automation selected
      await expect(automationSelector).toContainText(automationName)

      // Store the current URL (automation detail)
      const automationDetailUrl = page.url()
      expect(automationDetailUrl).toContain('/automations/')

      // Now switch to E2E Test Workspace 2
      await page.waitForTimeout(200) // Brief wait for dropdown state
      await workspaceSwitcher.click()
      dropdown = page.locator('details[open] > ul').first()
      await expect(dropdown).toBeVisible()
      await dropdown.getByRole('button', { name: 'E2E Test Workspace 2', exact: true }).click()
      await expect(workspaceSwitcher).toContainText('E2E Test Workspace 2')
      await page.waitForLoadState('networkidle')

      // Verify we were redirected to /automations (not staying on the detail page)
      const newUrl = page.url()
      expect(newUrl).toMatch(/\/automations\/?$/)

      // Verify the automation from Workspace 1 is NOT visible
      await expect(page.getByText(automationName)).not.toBeVisible()

      // Workspace 2 should show the empty state (no automations)
      await expect(page.getByText(/create your first automation/i)).toBeVisible()
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
      await page.waitForLoadState('networkidle')

      // Select our automation from the dropdown (in case another test created one simultaneously)
      const automationSelector = page.getByRole('button', { name: 'Select automation' })
      await automationSelector.click()
      const automationDropdown = page.locator('details[open] > ul').first()
      await expect(automationDropdown).toBeVisible()
      await automationDropdown.getByText(automation1Name).click()
      await page.waitForLoadState('networkidle')

      // Verify automation 1 is now selected
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

      // Verify automation 1 is available in workspace 1 by opening the automation selector
      await automationSelector.click()
      const finalDropdown = page.locator('details[open] > ul').first()
      await expect(finalDropdown).toBeVisible()
      await expect(finalDropdown.getByText(automation1Name)).toBeVisible()
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
      await page.waitForLoadState('networkidle')

      // Select our automation from the dropdown (in case another test created one simultaneously)
      const automationSelector = page.getByRole('button', { name: 'Select automation' })
      await automationSelector.click()
      const automationDropdown = page.locator('details[open] > ul').first()
      await expect(automationDropdown).toBeVisible()
      await automationDropdown.getByText(automationName).click()
      await page.waitForLoadState('networkidle')

      // Verify our automation is now selected
      await expect(automationSelector).toContainText(automationName)

      // Click delete button
      await page.getByTitle('Delete').click()

      // Confirm deletion in dialog (button text is "Confirm" from DialogForm default)
      const deleteDialog = page.getByRole('dialog')
      await expect(deleteDialog).toBeVisible()
      await expect(deleteDialog).toContainText(automationName)
      await deleteDialog.getByRole('button', { name: /confirm/i }).click()

      // Wait for navigation back to /automations (delete redirects there)
      await page.waitForURL(/\/automations\/?$/)
      await page.waitForLoadState('networkidle')

      // Verify automation is deleted - the name should not appear anywhere on the page
      await expect(page.getByText(automationName)).not.toBeVisible()
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
      await page.waitForLoadState('networkidle')

      // Select our automation from the dropdown (in case another test created one simultaneously)
      const automationSelector = page.getByRole('button', { name: 'Select automation' })
      await automationSelector.click()
      const automationDropdown = page.locator('details[open] > ul').first()
      await expect(automationDropdown).toBeVisible()
      await automationDropdown.getByText(automationName).click()
      await page.waitForLoadState('networkidle')

      // Verify items are displayed with status badges
      const table = page.locator('table')
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
      await page.waitForLoadState('networkidle')

      // Select our automation from the dropdown (in case another test created one simultaneously)
      const automationSelector = page.getByRole('button', { name: 'Select automation' })
      await automationSelector.click()
      const automationDropdown = page.locator('details[open] > ul').first()
      await expect(automationDropdown).toBeVisible()
      await automationDropdown.getByText(automationName).click()
      await page.waitForLoadState('networkidle')

      // Items tab should be active by default
      const itemsTab = page.getByRole('tab', { name: /items/i })
      await expect(itemsTab).toBeVisible()

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

      // Go back to Items tab
      await itemsTab.click()
      await page.waitForLoadState('networkidle')
      expect(page.url()).toMatch(/\/automations\/[^/]+\/?$/)
    })
  })
})
