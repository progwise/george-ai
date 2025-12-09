import { Locator, Page, expect } from '@playwright/test'

export const listSwitcher = (locator: Locator | Page) => {
  return locator.getByRole('group', { name: /switch list/i })
}

export const switchList = async (locator: Locator | Page, listName: string) => {
  const switcher = listSwitcher(locator)
  await expect(switcher).toBeVisible()
  const summary = switcher.locator('summary')
  await expect(summary).toBeVisible()
  const optionsList = switcher.getByRole('listbox')
  const isExpanded = await optionsList.isVisible()
  if (!isExpanded) {
    await summary.click()
  }
  await expect(optionsList).toBeVisible()
  await optionsList.getByRole('option', { name: listName, exact: true }).click()
  await expect(optionsList).not.toBeVisible()
  await expect(summary).toContainText(listName)
}

/**
 * Delete a list field by name via the UI.
 */
export const deleteField = async (page: Page, fieldName: string): Promise<void> => {
  // Open field actions menu using accessible label
  await page.getByRole('button', { name: `Field actions for ${fieldName}` }).click()

  // Click delete button with specific field name in aria-label
  await page.getByRole('button', { name: `Delete field ${fieldName}` }).click()

  // Click confirm delete button
  await page.getByRole('button', { name: `Confirm delete field ${fieldName}` }).click()
}
