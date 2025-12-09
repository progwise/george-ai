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

  // Wait for data to refetch after workspace switch
  // This gives TanStack Query time to invalidate and refetch all workspace-scoped queries
  // Check if locator is a Page (has waitForLoadState) or a Locator (has page() method)
  if ('waitForLoadState' in locator) {
    await locator.waitForLoadState('networkidle')
  } else {
    await locator.page().waitForLoadState('networkidle')
  }
}
