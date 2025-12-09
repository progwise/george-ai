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
