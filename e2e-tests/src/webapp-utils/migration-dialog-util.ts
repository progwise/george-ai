import { Locator, Page, expect } from '@playwright/test'

export const migrationDialog = (locator: Locator | Page) => {
  return locator.getByRole('dialog', { name: /migrate workspace/i })
}

export const closeMigrationDialogIfPresent = async (page: Page) => {
  const dialog = migrationDialog(page)
  const isVisible = await dialog.isVisible()
  if (isVisible) {
    const closeButton = dialog.getByRole('button', { name: /later/i })
    await expect(closeButton).toBeVisible()
    await closeButton.click()
    await expect(dialog).not.toBeVisible()
  }
}
