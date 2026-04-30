import { Locator, Page, expect } from '@playwright/test'

import { closeMigrationDialogIfPresent } from './migration-dialog-util'

interface CreateAutomationOptions {
  name: string
  list: string
  connector: string
}

/**
 * Creates a new automation via the UI.
 * Assumes the page is already logged in and in the correct workspace.
 */
export const createAutomation = async (page: Page, options: CreateAutomationOptions): Promise<void> => {
  const { name, list, connector } = options

  // Navigate to automations
  await page.goto('/automations')
  await page.waitForLoadState('networkidle')
  await closeMigrationDialogIfPresent(page)
  // Click "New Automation" button
  await page.getByLabel('Open sidebar').click({ force: true })
  const newAutomationButton = page.getByRole('button', { name: /create automation/i })
  await expect(newAutomationButton).toBeEnabled()
  await newAutomationButton.click()

  // Wait for dialog
  const dialog = page.getByRole('dialog', { name: /create automation/i })
  await expect(dialog).toBeVisible()

  // Fill automation form
  await dialog.getByLabel(/name/i).fill(name)

  // Select the list
  await dialog.getByLabel(/list/i).selectOption({ label: list })

  // Select the connector
  await dialog.getByLabel(/connector/i).selectOption({ label: connector })

  // Submit
  await dialog.getByRole('button', { name: /create/i }).click()

  // Wait for navigation to the new automation
  const nameGroup = page.getByRole('group', { name: 'Name', exact: true })
  await expect(nameGroup.getByRole('textbox')).toHaveValue(name)
}
