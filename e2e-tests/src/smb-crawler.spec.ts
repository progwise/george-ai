import { expect, test } from '@playwright/test'

import { loginToWebapp } from './webapp-utils/login-util'
import { switchWorkspace } from './webapp-utils/workspace-switcher-util'

// SMB test server hostname (varies by environment)
// - Local devcontainer: gai-smb-test
// - CI/docker-compose.local: gai-e2e-smb-test
const SMB_TEST_SERVER = process.env.E2E_SMB_TEST_SERVER || 'gai-smb-test'

test.describe('SMB Crawler', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await loginToWebapp(page)

    // Switch to E2E Test Workspace 1
    await switchWorkspace(page, 'E2E Test Workspace 1')

    // Navigate to libraries and select E2E Test Library
    await page.goto('/libraries')
    await page.getByRole('link', { name: 'E2E Test Library' }).click()
  })

  test('should create and run SMB crawler', async ({ page }) => {
    // Verify we're on the library page
    await expect(page.getByRole('heading', { name: 'E2E Test Library' })).toBeVisible()

    // Navigate to Crawlers tab
    await page.getByRole('tab', { name: /crawlers/i }).click()
    await page.waitForLoadState('networkidle')

    // Create new crawler
    await page.getByRole('button', { name: /add new crawler/i }).click()

    const dialog = page.getByRole('dialog', { name: /add new crawler/i })
    await expect(dialog).toBeVisible()

    // Fill in SMB crawler details
    await dialog.getByLabel(/^URI$/i).fill(`//${SMB_TEST_SERVER}/documents`)

    // Select SMB crawler type (radio button)
    await dialog.getByRole('radio', { name: /file share/i }).check()

    // Fill in credentials
    await dialog.getByLabel(/^Username$/i).fill('testuser1')
    await dialog.getByLabel(/^Password$/i).fill('password123')

    // Enable file filters
    await dialog.getByLabel(/Enable File Filters/i).check()

    // Set include patterns
    await dialog.getByLabel(/Include Patterns/i).fill('*.txt, *.md, *.pdf, *.docx')

    // Set exclude patterns
    await dialog.getByLabel(/Exclude Patterns/i).fill('**/temp/**, **/.git/**')

    // Submit crawler creation
    await dialog.getByRole('button', { name: /create/i }).click()
    await page.waitForLoadState('networkidle')

    // Verify crawler was created
    await expect(page.getByText(`smb: //${SMB_TEST_SERVER}/documents`)).toBeVisible()

    // Run the crawler (button text is "Crawl")
    await page.getByRole('button', { name: /^Crawl$/i }).click()

    // Wait for crawler to start (may take a moment to connect to SMB server)

    // Verify crawler is running (check for "Running" badge in the runs table)
    // await expect(page.locator('.badge').filter({ hasText: /Running/i })).toBeVisible({ timeout: 30000 })

    // Wait for crawler to complete (badge changes from "Running" to "Success")
    await expect(page.locator('.badge').filter({ hasText: /Success/i })).toBeVisible({ timeout: 60000 })

    const addedBadge = page.locator('.badge').filter({ hasText: /added:/i })
    await addedBadge.scrollIntoViewIfNeeded()
    // Verify files were discovered - check the run statistics
    await expect(page.locator('.badge').filter({ hasText: /added:/i })).toBeVisible()
  })

  test('should handle invalid credentials gracefully', async ({ page }) => {
    // Navigate to Crawlers tab
    await page.getByRole('tab', { name: /crawlers/i }).click()
    await page.waitForLoadState('networkidle')

    // Create crawler with invalid credentials
    await page.getByRole('button', { name: /add new crawler/i }).click()

    const dialog = page.getByRole('dialog', { name: /add new crawler/i })
    await expect(dialog).toBeVisible()

    await dialog.getByLabel(/^URI$/i).fill(`//${SMB_TEST_SERVER}/documents`)
    await dialog.getByRole('radio', { name: /file share/i }).check()
    await dialog.getByLabel(/^Username$/i).fill('invalid-user')
    await dialog.getByLabel(/^Password$/i).fill('wrong-password')

    await dialog.getByRole('button', { name: /create/i }).click()
    await page.waitForLoadState('networkidle')

    // Run the crawler (button text is "Crawl")
    await page.getByRole('button', { name: /^Crawl$/i }).click()

    // Verify the crawler run fails with "Failed" status badge
    await expect(page.locator('.badge').filter({ hasText: /^Failed$/i })).toBeVisible({
      timeout: 30000,
    })
  })
})
