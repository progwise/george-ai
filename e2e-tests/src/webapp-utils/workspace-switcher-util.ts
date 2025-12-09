import { Locator, Page, expect } from '@playwright/test'

export const workspaceSwitcher = (locator: Locator | Page) => {
  return locator.getByRole('group', { name: /select workspace/i })
}

export const switchWorkspace = async (locator: Locator | Page, workspaceName: string) => {
  const switcher = workspaceSwitcher(locator)
  await expect(switcher).toBeVisible()
  const summary = switcher.locator('summary')
  await expect(summary).toBeVisible()
  const optionsList = switcher.getByRole('listbox')
  const isExpanded = await optionsList.isVisible()
  if (!isExpanded) {
    await summary.click()
  }
  await expect(optionsList).toBeVisible()
  await optionsList.getByRole('option', { name: workspaceName, exact: true }).click()
  await expect(optionsList).not.toBeVisible()
  await expect(summary).toContainText(workspaceName)
}
