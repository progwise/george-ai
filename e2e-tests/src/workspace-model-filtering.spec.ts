import { expect, test } from '@playwright/test'

import { loginToWebapp } from './webapp-utils/login-util'
import { switchWorkspace } from './webapp-utils/workspace-switcher-util'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL

// Skip tests if API keys are not configured
const hasOpenAI = Boolean(OPENAI_API_KEY && OPENAI_API_KEY.length > 0)
const hasOllama = Boolean(OLLAMA_BASE_URL && OLLAMA_BASE_URL.length > 0)
const skipTest = !hasOpenAI || !hasOllama

/**
 * Workspace Model Filtering Tests
 *
 * Tests that AI models are correctly filtered by workspace provider configuration.
 * Requires both OPENAI_API_KEY and OLLAMA_BASE_URL in environment.
 *
 * - E2E Test Workspace 1: OpenAI provider only
 * - E2E Test Workspace 2: Ollama provider only
 */
test.describe('Workspace Model Filtering', () => {
  test.skip(skipTest, 'Skipping: OPENAI_API_KEY and OLLAMA_BASE_URL required in .env')

  test.beforeEach(async ({ page }) => {
    await loginToWebapp(page)
  })

  test('should show only OpenAI models in workspace with OpenAI provider', async ({ page }) => {
    await switchWorkspace(page, 'E2E Test Workspace 1')

    // Navigate to library creation
    await page.getByRole('link', { name: 'Libraries' }).click()
    await page.getByRole('button', { name: /new/i }).click()

    const dialog = page.locator('dialog[open]')
    await expect(dialog).toBeVisible()

    // Create library
    await dialog.getByLabel(/library name/i).fill('Test OpenAI Library')
    await dialog.getByRole('button', { name: /create/i }).click()

    await expect(page).toHaveURL(/\/libraries\/.*\/settings$/)

    // Click embedding model dropdown
    const embeddingFieldset = page.locator('fieldset').filter({ hasText: 'AI Model for Embeddings' })
    await embeddingFieldset.getByText('AI Model for Embeddings').click()

    const modelListbox = embeddingFieldset.getByRole('listbox', { name: 'Available models' })
    await expect(modelListbox).toBeVisible()

    // Count model types
    const modelButtons = modelListbox.getByRole('option')
    const count = await modelButtons.count()

    let openaiCount = 0
    let ollamaCount = 0

    for (let i = 0; i < count; i++) {
      const text = await modelButtons.nth(i).textContent()
      if (
        text?.includes('openai') ||
        text?.toLowerCase().includes('gpt') ||
        text?.toLowerCase().includes('text-embedding')
      ) {
        openaiCount++
      }
      if (
        text?.includes('ollama') ||
        text?.toLowerCase().includes('llama') ||
        text?.toLowerCase().includes('mistral') ||
        text?.toLowerCase().includes('bge')
      ) {
        ollamaCount++
      }
    }

    expect(openaiCount).toBeGreaterThan(0)
    expect(ollamaCount).toBe(0)

    await page.keyboard.press('Escape')
  })

  test('should show only Ollama models in workspace with Ollama provider', async ({ page }) => {
    await switchWorkspace(page, 'E2E Test Workspace 2')

    // Navigate to library creation
    await page.getByRole('link', { name: 'Libraries' }).click()
    await page.getByRole('button', { name: /new/i }).click()

    const dialog = page.locator('dialog[open]')
    await expect(dialog).toBeVisible()

    // Create library
    await dialog.getByLabel(/library name/i).fill('Test Ollama Library')
    await dialog.getByRole('button', { name: /create/i }).click()

    await expect(page).toHaveURL(/\/libraries\/.*\/settings$/)

    // Click embedding model dropdown
    const embeddingFieldset = page.locator('fieldset').filter({ hasText: 'AI Model for Embeddings' })
    await embeddingFieldset.getByText('AI Model for Embeddings').click()

    const modelListbox = embeddingFieldset.getByRole('listbox', { name: 'Available models' })
    await expect(modelListbox).toBeVisible()

    // Count model types
    const modelButtons = modelListbox.getByRole('option')
    const count = await modelButtons.count()

    let openaiCount = 0
    let ollamaCount = 0

    for (let i = 0; i < count; i++) {
      const text = await modelButtons.nth(i).textContent()
      if (
        text?.includes('openai') ||
        text?.toLowerCase().includes('gpt') ||
        text?.toLowerCase().includes('text-embedding-3')
      ) {
        openaiCount++
      }
      if (
        text?.includes('ollama') ||
        text?.toLowerCase().includes('llama') ||
        text?.toLowerCase().includes('mistral') ||
        text?.toLowerCase().includes('nomic') ||
        text?.toLowerCase().includes('mxbai') ||
        text?.toLowerCase().includes('bge')
      ) {
        ollamaCount++
      }
    }

    expect(ollamaCount).toBeGreaterThan(0)
    expect(openaiCount).toBe(0)

    await page.keyboard.press('Escape')
  })
})
