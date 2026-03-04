import { Locator, Page, expect } from '@playwright/test'

export const switchList = async (locator: Locator | Page, listName: string) => {
  const listIcon = locator.getByTitle(/select list/i)
  await listIcon.hover()
  const listElement = locator.getByRole('link', { name: listName })
  await expect(listElement).toBeVisible()
  await listElement.click()
}

/**
 * Delete a list field by name via the UI.
 */
export const deleteField = async (page: Page, fieldName: string): Promise<void> => {
  // Open field actions menu using accessible label
  const fieldActionsButton = page.getByRole('button', { name: `Field actions for ${fieldName}` })
  await expect(fieldActionsButton).toBeVisible()
  await fieldActionsButton.hover()

  // Click delete button with specific field name in aria-label
  const deleteButton = page.getByRole('button', { name: `Delete field ${fieldName}` })
  await expect(deleteButton).toBeVisible()
  await deleteButton.click()
  const confirmButton = page.getByRole('button', { name: `Confirm delete field ${fieldName}` })
  await expect(confirmButton).toBeVisible()
  await confirmButton.click()
}
