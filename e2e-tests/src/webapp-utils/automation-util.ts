import { Locator, Page, expect } from '@playwright/test'

export const automationSwitcher = (locator: Locator | Page) => {
  return locator.getByRole('group', { name: /switch automation/i })
}

export const switchAutomation = async (locator: Locator | Page, automationName: string) => {
  const switcher = automationSwitcher(locator)
  await expect(switcher).toBeVisible()
  const summary = switcher.locator('summary')
  await expect(summary).toBeVisible()
  const optionsList = switcher.getByRole('listbox')
  const isExpanded = await optionsList.isVisible()
  if (!isExpanded) {
    await summary.click()
  }
  await expect(optionsList).toBeVisible()
  await optionsList.getByRole('option', { name: automationName, exact: true }).click()
  await expect(optionsList).not.toBeVisible()
  await expect(summary).toContainText(automationName)
}

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

  // Click "New Automation" button
  const newAutomationButton = page.getByRole('button', { name: /new automation/i })
  await expect(newAutomationButton).toBeEnabled()
  await newAutomationButton.click()

  // Wait for dialog
  const dialog = page.getByRole('dialog', { name: /create automation/i })
  await expect(dialog).toBeVisible()

  // Fill automation form
  await dialog.getByLabel(/name/i).fill(name)

  // Select the list
  await dialog.getByLabel(/list/i).click()
  await page.getByRole('option', { name: list }).click()

  // Select the connector
  await dialog.getByLabel(/connector/i).click()
  await page.getByRole('option', { name: connector }).click()

  // Submit
  await dialog.getByRole('button', { name: /create/i }).click()

  // Wait for navigation to the new automation
  const switcher = automationSwitcher(page)
  await expect(switcher.locator('summary')).toContainText(name)
}
