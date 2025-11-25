import { Page, expect, test } from '@playwright/test'

const E2E_USERNAME = process.env.E2E_USERNAME!
const E2E_PASSWORD = process.env.E2E_PASSWORD!

/**
 * E2E tests for List Field Modal - CRUD operations
 *
 * IMPORTANT: The test list "E2E Test List - Field Modal" is created in global-setup.ts
 * with sample data so the list items table renders and "Add Field" button is available.
 * These tests focus on enrichment field CRUD operations, not list creation.
 *
 * Tests creating and editing enrichment fields with various configurations,
 * ensuring all settings are preserved when switching between tabs.
 *
 * Does NOT test actual enrichment execution - only UI persistence.
 *
 * Cleanup: All test lists are deleted in global-teardown.ts
 */

test.describe.configure({ mode: 'serial' })

/**
 * Helper function to delete a field by name
 */
async function deleteField(page: Page, fieldName: string) {
  // Open field actions menu using accessible label
  await page.getByRole('button', { name: `Field actions for ${fieldName}` }).click()

  // Click delete button with specific field name in aria-label
  await page.getByRole('button', { name: `Delete field ${fieldName}` }).click()

  // Click confirm delete button
  await page.getByRole('button', { name: `Confirm delete field ${fieldName}` }).click()
}

test.describe('List Field Modal', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all browser state to ensure completely fresh session
    // This is critical to avoid stale workspace selections from previous test runs
    await context.clearCookies()
    await context.clearPermissions()

    // Navigate to page BEFORE clearing storage (otherwise nothing to clear)
    await page.goto('/')

    // Clear all storage types
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
      // Clear all cookies via JavaScript as well (belt and suspenders)
      document.cookie.split(';').forEach((c) => {
        document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
      })
    })

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

    // Wait for login to complete - wait for URL change first
    await page.waitForURL('/', { timeout: 10000 })
    await page.waitForLoadState('networkidle')

    // Then verify the page loaded correctly
    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible({ timeout: 10000 })

    // Switch to E2E Test Workspace 1 (where our test list exists)
    await page.getByRole('button', { name: /switch workspace/i }).click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()
    await expect(page.getByRole('button', { name: /switch workspace/i })).toContainText('E2E Test Workspace 1')
    await page.waitForLoadState('networkidle')

    // Navigate to lists page (will auto-redirect to first list)
    await page.goto('/lists')
    await page.waitForLoadState('networkidle')

    // Click the list selector dropdown (use summary element with aria-label)
    await page.getByRole('button', { name: /select list/i }).click()

    // Select our test list from the dropdown
    await page.getByRole('link', { name: 'E2E Test List - Field Modal', exact: true }).click()
    await page.waitForLoadState('networkidle')

    // Now we're on the correct list detail page - find and scroll to "Add enrichment field" button
    const addFieldButton = page.getByTitle('Add enrichment field')
    await addFieldButton.scrollIntoViewIfNeeded()
    await expect(addFieldButton).toBeVisible({ timeout: 10000 })
  })

  test('should create text field with field reference context', async ({ page }) => {
    // Click "Add enrichment field" button (already scrolled into view in beforeEach)
    await page.getByTitle('Add enrichment field').click()

    // Fill Basic tab
    await page.getByLabel(/field name/i).fill('Summary')
    await page.getByLabel(/data type/i).selectOption('text')

    // Select first available language model
    await page.getByText('Large Language Model').click()
    const modelListbox = page.getByRole('listbox', { name: 'Available models' })
    await expect(modelListbox).toBeVisible()
    await modelListbox.getByRole('option').first().click()

    await page.getByLabel(/prompt/i).fill('Summarize the document')

    // Switch to Context tab
    await page.getByRole('tab', { name: /context/i }).click()

    // Switch to Referenced Fields sub-tab (if not already active)
    await page.getByRole('button', { name: /referenced fields/i }).click()

    // Check the first available field reference checkbox (accessible selector)
    const firstCheckbox = page.getByRole('checkbox', { name: /reference field:/i }).first()
    await firstCheckbox.check()

    // Submit
    await page.getByRole('button', { name: /add field/i }).click()

    // Verify field was created - check for the sortable field header
    await expect(page.getByRole('button', { name: 'Sort by Summary' })).toBeVisible()

    // Cleanup: Delete the created field
    await deleteField(page, 'Summary')
  })

  test('should create field with vector search context', async ({ page }) => {
    // Click "Add enrichment field" button
    await page.getByTitle('Add enrichment field').click()

    // Basic info
    await page.getByLabel(/field name/i).fill('Technical Specs')
    await page.getByLabel(/data type/i).selectOption('text')

    // Select language model
    await page.getByText('Large Language Model').click()
    const modelListbox = page.getByRole('listbox', { name: 'Available models' })
    await expect(modelListbox).toBeVisible()
    await modelListbox.getByRole('option').first().click()

    await page.getByLabel(/prompt/i).fill('Extract technical specifications')

    // Context > Similar Content
    await page.getByRole('tab', { name: /context/i }).click()
    await page.getByRole('button', { name: /similar content/i }).click()

    // Fill vector search parameters using accessible labels
    await page.getByLabel('Query Template').fill('{{Name}} technical details')
    await page.getByLabel('Max Chunks').fill('10')
    await page.getByLabel('Max Distance').fill('0.3')
    await page.getByLabel('Maximum tokens for vector search results').fill('2000')

    // Submit
    await page.getByRole('button', { name: /add field/i }).click()

    await expect(page.getByRole('button', { name: 'Sort by Technical Specs' })).toBeVisible()

    // Cleanup
    await deleteField(page, 'Technical Specs')
  })

  test('should create field with web fetch context', async ({ page }) => {
    // Click "Add enrichment field" button
    await page.getByTitle('Add enrichment field').click()

    // Basic info
    await page.getByLabel(/field name/i).fill('External Data')
    await page.getByLabel(/data type/i).selectOption('text')

    // Select language model
    await page.getByText('Large Language Model').click()
    const modelListbox = page.getByRole('listbox', { name: 'Available models' })
    await expect(modelListbox).toBeVisible()
    await modelListbox.getByRole('option').first().click()

    await page.getByLabel(/prompt/i).fill('Extract data from external source')

    // Context > Web Fetch
    await page.getByRole('tab', { name: /context/i }).click()
    await page.getByRole('button', { name: /web fetch/i }).click()

    // Fill URL template (one form is already visible by default)
    await page.getByLabel('URL Template').first().fill('https://api.example.com/products/{{ProductId}}')
    await page.getByLabel('Maximum tokens for web fetch content').first().fill('1500')

    // Submit
    await page.getByRole('button', { name: /add field/i }).click()

    await expect(page.getByRole('button', { name: 'Sort by External Data' })).toBeVisible()

    // Cleanup
    await deleteField(page, 'External Data')
  })

  test('should create field with all context types', async ({ page }) => {
    // Click "Add enrichment field" button
    await page.getByTitle('Add enrichment field').click()

    // Basic
    await page.getByLabel(/field name/i).fill('Comprehensive Field')
    await page.getByLabel(/data type/i).selectOption('text')

    // Select language model
    await page.getByText('Large Language Model').click()
    const modelListbox = page.getByRole('listbox', { name: 'Available models' })
    await expect(modelListbox).toBeVisible()
    await modelListbox.getByRole('option').first().click()

    await page.getByLabel(/prompt/i).fill('Process all available context')
    await page.getByLabel(/failure terms/i).fill('unknown, n/a, not found')

    // Context > Referenced Fields
    await page.getByRole('tab', { name: /context/i }).click()
    await page.getByRole('button', { name: /referenced fields/i }).click()

    const firstCheckbox = page.getByRole('checkbox', { name: /reference field:/i }).first()
    await firstCheckbox.check()

    // Context > Similar Content
    await page.getByRole('button', { name: /similar content/i }).click()

    // Fill the first (default) vector search form
    await page.getByLabel('Query Template').first().fill('{{Name}} details')
    await page.getByLabel('Max Chunks').first().fill('5')
    await page.getByLabel('Max Distance').first().fill('0.5')

    // Context > Web Fetch
    await page.getByRole('button', { name: /web fetch/i }).click()

    await page.getByLabel('URL Template').first().fill('https://example.com/{{Name}}')

    // Submit
    await page.getByRole('button', { name: /add field/i }).click()

    await expect(page.getByRole('button', { name: 'Sort by Comprehensive Field' })).toBeVisible()

    // Note: This field is used by the next test, so we DON'T delete it here
  })

  test('should preserve all settings when editing field - switch between tabs', async ({ page }) => {
    // Wait for the Comprehensive Field to be visible (list selector is already open)
    await expect(page.getByRole('button', { name: 'Sort by Comprehensive Field' })).toBeVisible()

    // Open field actions menu
    await page.getByRole('button', { name: 'Field actions for Comprehensive Field' }).click()

    // Click edit button
    await page.getByRole('button', { name: 'Edit field Comprehensive Field' }).click()

    // Wait for modal to open
    await expect(page.getByLabel(/field name/i)).toBeVisible()

    // Verify Basic tab values preserved
    await expect(page.getByLabel(/field name/i)).toHaveValue('Comprehensive Field')
    await expect(page.getByLabel(/data type/i)).toHaveValue('text')
    await expect(page.getByLabel(/prompt/i)).toHaveValue('Process all available context')
    await expect(page.getByLabel(/failure terms/i)).toHaveValue('unknown, n/a, not found')

    // Switch to Context tab and verify field reference
    await page.getByRole('tab', { name: /context/i }).click()
    await page.getByRole('button', { name: /referenced fields/i }).click()

    // Verify at least one field reference checkbox is checked
    const checkedCheckbox = page.getByRole('checkbox', { name: /reference field:/i, checked: true }).first()
    await expect(checkedCheckbox).toBeVisible()

    // Switch to Similar Content and verify vector search values
    await page.getByRole('button', { name: /similar content/i }).click()
    await expect(page.getByLabel('Query Template').first()).toHaveValue('{{Name}} details')
    await expect(page.getByLabel('Max Chunks').first()).toHaveValue('5')
    await expect(page.getByLabel('Max Distance').first()).toHaveValue('0.5')

    // Switch to Web Fetch and verify URL
    await page.getByRole('button', { name: /web fetch/i }).click()
    await expect(page.getByLabel('URL Template').first()).toHaveValue('https://example.com/{{Name}}')

    // Switch back to Instruction tab - verify values still preserved
    await page.getByRole('tab', { name: /instruction/i }).click()
    await expect(page.getByLabel(/field name/i)).toHaveValue('Comprehensive Field')
    await expect(page.getByLabel(/prompt/i)).toHaveValue('Process all available context')

    // Close without saving
    await page.getByRole('button', { name: /cancel|close/i }).click()
  })

  test('should add multiple vector searches', async ({ page }) => {
    // Click "Add enrichment field" button
    await page.getByTitle('Add enrichment field').click()

    await page.getByLabel(/field name/i).fill('Multi-Search Field')
    await page.getByLabel(/data type/i).selectOption('text')

    // Select language model
    await page.getByText('Large Language Model').click()
    const modelListbox = page.getByRole('listbox', { name: 'Available models' })
    await expect(modelListbox).toBeVisible()
    await modelListbox.getByRole('option').first().click()

    await page.getByLabel(/prompt/i).fill('Use multiple searches')

    // Add three vector searches
    await page.getByRole('tab', { name: /context/i }).click()
    await page.getByRole('button', { name: /similar content/i }).click()

    // First search (one form is already visible by default)
    await page.getByLabel('Query Template').first().fill('{{Name}} specifications')

    // Second search
    await page.getByRole('button', { name: /add vector search|add another/i }).click()
    await page.getByLabel('Query Template').nth(1).fill('{{Name}} features')

    // Third search
    await page.getByRole('button', { name: /add vector search|add another/i }).click()
    await page.getByLabel('Query Template').nth(2).fill('{{Name}} comparison')

    // Verify all three are visible
    await expect(page.getByLabel('Query Template').first()).toHaveValue('{{Name}} specifications')
    await expect(page.getByLabel('Query Template').nth(1)).toHaveValue('{{Name}} features')
    await expect(page.getByLabel('Query Template').nth(2)).toHaveValue('{{Name}} comparison')

    // Save
    await page.getByRole('button', { name: /add field/i }).click()

    await expect(page.getByRole('button', { name: 'Sort by Multi-Search Field' })).toBeVisible()

    // Cleanup
    await deleteField(page, 'Multi-Search Field')
  })

  test('should show context count badge', async ({ page }) => {
    // Open field actions menu
    await page.getByRole('button', { name: 'Field actions for Comprehensive Field' }).click()

    // Click edit button
    await page.getByRole('button', { name: 'Edit field Comprehensive Field' }).click()

    // Wait for modal to open
    await expect(page.getByLabel(/field name/i)).toBeVisible()

    // Check Context tab shows count (1 field ref + 1 vector search + 1 web fetch = 3)
    // The tab is a radio input with aria-label, not text content
    await expect(page.getByRole('tab', { name: /context.*3/i })).toBeVisible()

    // Close the modal
    await page.getByRole('button', { name: /cancel|close/i }).click()

    // Cleanup: Delete the Comprehensive Field (used by multiple tests)
    await deleteField(page, 'Comprehensive Field')
  })

  test('should handle different data types', async ({ page }) => {
    const dataTypes = ['string', 'number', 'boolean']

    for (const dataType of dataTypes) {
      // Click "Add enrichment field" button (scroll into view each time)
      const addFieldButton = page.getByTitle('Add enrichment field')
      await addFieldButton.scrollIntoViewIfNeeded()
      await addFieldButton.click()

      await page.getByLabel(/field name/i).fill(`${dataType} Field`)
      await page.getByLabel(/data type/i).selectOption(dataType)

      // Select language model
      await page.getByText('Large Language Model').click()
      const modelListbox = page.getByRole('listbox', { name: 'Available models' })
      await expect(modelListbox).toBeVisible()
      await modelListbox.getByRole('option').first().click()

      await page.getByLabel(/prompt/i).fill(`Extract ${dataType} value`)

      await page.getByRole('button', { name: /add field/i }).click()

      await expect(page.getByRole('button', { name: `Sort by ${dataType} Field` })).toBeVisible()

      // Cleanup
      await deleteField(page, `${dataType} Field`)
    }
  })

  test('should handle modal reopen without errors', async ({ page }) => {
    // Open modal
    await page.getByTitle('Add enrichment field').click()

    // Verify modal opens without errors
    await expect(page.getByLabel(/field name/i)).toBeVisible()
    await expect(page.getByLabel(/field name/i)).toHaveValue('')

    // Fill some data
    await page.getByLabel(/field name/i).fill('Test Field')

    // Close modal
    await page.getByRole('button', { name: /cancel|close/i }).click()

    // Reopen modal immediately
    await page.getByTitle('Add enrichment field').click()

    // Verify modal reopens without errors (form state persists - this is expected behavior)
    await expect(page.getByLabel(/field name/i)).toBeVisible()

    // Clear the field
    await page.getByLabel(/field name/i).clear()

    // Close and reopen again
    await page.getByRole('button', { name: /cancel|close/i }).click()
    await page.getByTitle('Add enrichment field').click()

    // Should not throw DOM errors
    await expect(page.getByLabel(/field name/i)).toBeVisible()

    // Close modal to clean up
    await page.getByRole('button', { name: /cancel|close/i }).click()
  })
})
