import { expect, test } from '@playwright/test'

const MARKETING_WEBSITE_URL = process.env.MARKETING_WEBSITE_URL || 'http://localhost:4321'
const EXPECTED_DISCORD_URL = process.env.EXPECTED_DISCORD_URL || 'https://discord.gg/GbQFKb2MNJ'

test.describe('Marketing Website', () => {
  test('Discord link on contact page has valid href', async ({ page }) => {
    // Navigate to contact page
    await page.goto(`${MARKETING_WEBSITE_URL}/contact`)

    // Find the Discord link within the Discord Community card
    const discordLink = page.getByRole('link', { name: /join discord/i })

    // Scroll element into view before checking visibility
    await discordLink.scrollIntoViewIfNeeded()

    // Verify link exists and is visible
    await expect(discordLink).toBeVisible()

    // Verify link has a valid href attribute
    const href = await discordLink.getAttribute('href')
    expect(href).toBeTruthy()
    expect(href).not.toBe('')
    expect(href).toMatch(/^https:\/\/discord\.gg\//)

    // Verify it's the correct Discord server
    expect(href).toBe(EXPECTED_DISCORD_URL)
  })

  test('Discord link on docs page has valid href', async ({ page }) => {
    // Navigate to docs page
    await page.goto(`${MARKETING_WEBSITE_URL}/docs`)

    // Find the Discord link in the "Need Help?" section
    const discordLink = page.getByRole('link', { name: /join discord community/i })

    // Scroll element into view before checking visibility
    await discordLink.scrollIntoViewIfNeeded()

    // Verify link exists and is visible
    await expect(discordLink).toBeVisible()

    // Verify link has a valid href attribute
    const href = await discordLink.getAttribute('href')
    expect(href).toBeTruthy()
    expect(href).not.toBe('')
    expect(href).toMatch(/^https:\/\/discord\.gg\//)

    // Verify it's the correct Discord server
    expect(href).toBe(EXPECTED_DISCORD_URL)
  })

  test('Discord link opens in new tab', async ({ page }) => {
    await page.goto(`${MARKETING_WEBSITE_URL}/contact`)

    const discordLink = page.getByRole('link', { name: /join discord/i })

    // Scroll element into view before checking attributes
    await discordLink.scrollIntoViewIfNeeded()

    // Verify it has target="_blank" and rel="noopener noreferrer" for security
    await expect(discordLink).toHaveAttribute('target', '_blank')
    await expect(discordLink).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
