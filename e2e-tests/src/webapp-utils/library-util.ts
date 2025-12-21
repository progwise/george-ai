import { Locator, Page, expect } from '@playwright/test'

export const librarySwitcher = (locator: Locator | Page) => {
  return locator.getByRole('group', { name: /select library/i })
}

export const switchLibrary = async (locator: Locator | Page, libraryName: string) => {
  const switcher = librarySwitcher(locator)
  await expect(switcher).toBeVisible()
  const summary = switcher.locator('summary')
  await expect(summary).toBeVisible()
  const optionsList = switcher.getByRole('listbox')
  const isExpanded = await optionsList.isVisible()
  if (!isExpanded) {
    await summary.click()
  }
  await expect(optionsList).toBeVisible()
  await optionsList.getByRole('option', { name: libraryName, exact: true }).click()
  await expect(optionsList).not.toBeVisible()
  await expect(summary).toContainText(libraryName)

  // Wait for data to refetch after library switch
  // Check if locator is a Page (has waitForLoadState) or a Locator (has page() method)
  if ('waitForLoadState' in locator) {
    await locator.waitForLoadState('networkidle')
  } else {
    await locator.page().waitForLoadState('networkidle')
  }
}
