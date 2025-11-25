import { expect, test } from '@playwright/test'

const E2E_USERNAME = process.env.E2E_USERNAME!
const E2E_PASSWORD = process.env.E2E_PASSWORD!
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL

// Skip tests if API keys are not configured
const hasOpenAI = Boolean(OPENAI_API_KEY && OPENAI_API_KEY.length > 0)
const hasOllama = Boolean(OLLAMA_BASE_URL && OLLAMA_BASE_URL.length > 0)
const skipTest = !hasOpenAI || !hasOllama

test.describe('Workspace Model Filtering', () => {
  test.skip(skipTest, 'Skipping: OPENAI_API_KEY and OLLAMA_BASE_URL required in .env')

  test.beforeEach(async ({ page }) => {
    // Debug listeners
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

    // Wait for login to complete
    await expect(page.getByRole('heading', { name: /overview/i })).toBeVisible()
  })

  test('should show only OpenAI models in workspace with OpenAI provider', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Switch to E2E Test Workspace 1 (OpenAI only)
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await expect(workspaceSwitcher).toBeVisible()
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
    await page.waitForTimeout(500) // Wait for toast to disappear

    // Navigate to library creation
    await page.getByRole('link', { name: 'Libraries' }).click()
    await page.getByRole('button', { name: /new/i }).click()

    // Wait for dialog to open
    const dialog = page.locator('dialog[open]')
    await expect(dialog).toBeVisible()

    // Fill library name and create
    await dialog.getByLabel(/library name/i).fill('Test OpenAI Library')
    await dialog.getByRole('button', { name: /create/i }).click()

    // Wait for navigation to settings page (library creation navigates directly to settings)
    await expect(page).toHaveURL(/\/libraries\/.*\/settings$/)

    // No need to open accordion - it's now always visible as a card
    // Click embedding model dropdown
    // Scope to the embedding model fieldset to avoid selecting OCR model dropdown
    const embeddingFieldset = page.locator('fieldset').filter({ hasText: 'AI Model for Embeddings' })
    const embeddingModelLabel = embeddingFieldset.getByText('AI Model for Embeddings')
    await embeddingModelLabel.scrollIntoViewIfNeeded()
    await embeddingModelLabel.click()

    // Wait for dropdown menu to appear - verify by checking for the listbox
    const modelListbox = embeddingFieldset.getByRole('listbox', { name: 'Available models' })
    await expect(modelListbox).toBeVisible()

    // Get all model option buttons in the dropdown
    const modelButtons = modelListbox.getByRole('option')
    const count = await modelButtons.count()

    // Verify all visible models are OpenAI models
    let openaiModelCount = 0
    let ollamaModelCount = 0

    for (let i = 0; i < count; i++) {
      const modelText = await modelButtons.nth(i).textContent()
      if (
        modelText?.includes('openai') ||
        modelText?.toLowerCase().includes('gpt') ||
        modelText?.toLowerCase().includes('text-embedding')
      ) {
        openaiModelCount++
      }
      if (
        modelText?.includes('ollama') ||
        modelText?.toLowerCase().includes('llama') ||
        modelText?.toLowerCase().includes('mistral') ||
        modelText?.toLowerCase().includes('bge')
      ) {
        ollamaModelCount++
      }
    }

    // Should have OpenAI models, no Ollama models
    expect(openaiModelCount).toBeGreaterThan(0)
    expect(ollamaModelCount).toBe(0)

    // Close dropdown
    await page.keyboard.press('Escape')
  })

  test('should show only Ollama models in workspace with Ollama provider', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Switch to E2E Test Workspace 2 (Ollama only)
    const workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await expect(workspaceSwitcher).toBeVisible()
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 2', exact: true }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 2')
    await page.waitForTimeout(500) // Wait for toast to disappear

    // Navigate to library creation
    await page.getByRole('link', { name: 'Libraries' }).click()
    await page.getByRole('button', { name: /new/i }).click()

    // Wait for dialog to open
    const dialog = page.locator('dialog[open]')
    await expect(dialog).toBeVisible()

    // Fill library name and create
    await dialog.getByLabel(/library name/i).fill('Test Ollama Library')
    await dialog.getByRole('button', { name: /create/i }).click()

    // Wait for navigation to settings page (library creation navigates directly to settings)
    await expect(page).toHaveURL(/\/libraries\/.*\/settings$/)

    // No need to open accordion - it's now always visible as a card
    // Click embedding model dropdown
    // Scope to the embedding model fieldset to avoid selecting OCR model dropdown
    const embeddingFieldset = page.locator('fieldset').filter({ hasText: 'AI Model for Embeddings' })
    const embeddingModelLabel = embeddingFieldset.getByText('AI Model for Embeddings')
    await embeddingModelLabel.scrollIntoViewIfNeeded()
    await embeddingModelLabel.click()

    // Wait for dropdown menu to appear - verify by checking for the listbox
    const modelListbox = embeddingFieldset.getByRole('listbox', { name: 'Available models' })
    await expect(modelListbox).toBeVisible()

    // Get all model option buttons in the dropdown
    const modelButtons = modelListbox.getByRole('option')
    const count = await modelButtons.count()

    // Verify all visible models are Ollama models
    let openaiModelCount = 0
    let ollamaModelCount = 0

    for (let i = 0; i < count; i++) {
      const modelText = await modelButtons.nth(i).textContent()
      if (
        modelText?.includes('openai') ||
        modelText?.toLowerCase().includes('gpt') ||
        modelText?.toLowerCase().includes('text-embedding-3')
      ) {
        openaiModelCount++
      }
      if (
        modelText?.includes('ollama') ||
        modelText?.toLowerCase().includes('llama') ||
        modelText?.toLowerCase().includes('mistral') ||
        modelText?.toLowerCase().includes('nomic') ||
        modelText?.toLowerCase().includes('mxbai') ||
        modelText?.toLowerCase().includes('bge')
      ) {
        ollamaModelCount++
      }
    }

    // Should have Ollama models, no OpenAI models
    expect(ollamaModelCount).toBeGreaterThan(0)
    expect(openaiModelCount).toBe(0)

    // Close dropdown
    await page.keyboard.press('Escape')
  })

  test('should update available models when switching workspaces', async ({ page }) => {
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Switch to E2E Test Workspace 1 (OpenAI)
    let workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await expect(workspaceSwitcher).toBeVisible()
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 1', exact: true }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 1')
    await page.waitForTimeout(500) // Wait for toast to disappear

    // Navigate to assistant creation
    await page.getByRole('link', { name: 'Assistants' }).click()
    await page.getByRole('button', { name: /create assistant/i }).click()

    // Wait for dialog
    let dialog = page.locator('dialog[open]')
    await expect(dialog).toBeVisible()

    // Fill assistant name and create
    await dialog.getByLabel(/name/i).fill('Test Assistant')
    await dialog.getByRole('button', { name: /create/i }).click()

    // Wait for navigation to assistant details page
    await expect(page).toHaveURL(/\/assistants\/[^/]+$/)

    // Click language model dropdown
    const languageModelFieldset = page.locator('fieldset').filter({ hasText: /language model/i })
    const languageModelButton = languageModelFieldset.getByRole('button', { name: /language model:/i })
    await languageModelButton.scrollIntoViewIfNeeded()
    await languageModelButton.click()

    // Wait for dropdown menu to appear - verify by checking for the listbox
    let modelListbox = languageModelFieldset.getByRole('listbox', { name: 'Available models' })
    await expect(modelListbox).toBeVisible()

    // Get all model option buttons in the dropdown
    const firstWorkspaceModels = modelListbox.getByRole('option')
    const firstCount = await firstWorkspaceModels.count()

    let firstOpenaiCount = 0
    let firstOllamaCount = 0

    for (let i = 0; i < firstCount; i++) {
      const modelText = await firstWorkspaceModels.nth(i).getAttribute('aria-label')
      if (
        modelText?.includes('openai') ||
        modelText?.toLowerCase().includes('gpt') ||
        modelText?.toLowerCase().includes('text-embedding')
      ) {
        firstOpenaiCount++
      }
      if (
        modelText?.includes('ollama') ||
        modelText?.toLowerCase().includes('llama') ||
        modelText?.toLowerCase().includes('mistral') ||
        modelText?.toLowerCase().includes('nomic') ||
        modelText?.toLowerCase().includes('mxbai') ||
        modelText?.toLowerCase().includes('qwen') ||
        modelText?.toLowerCase().includes('phi') ||
        modelText?.toLowerCase().includes('gemma') ||
        modelText?.toLowerCase().includes('bge')
      ) {
        firstOllamaCount++
      }
    }

    // Close dropdown
    await page.keyboard.press('Escape')

    // Switch to E2E Test Workspace 2 (Ollama)
    workspaceSwitcher = page.getByRole('button', { name: 'Switch workspace' })
    await workspaceSwitcher.click()
    await page.getByRole('button', { name: 'E2E Test Workspace 2', exact: true }).click()
    await expect(workspaceSwitcher).toContainText('E2E Test Workspace 2')
    await page.waitForTimeout(500) // Wait for toast to disappear

    // Should navigate to assistants list (away from detail page)
    await expect(page).toHaveURL(/\/assistants$/)

    // Create another assistant
    await page.getByRole('button', { name: /create assistant/i }).click()
    dialog = page.locator('dialog[open]')
    await expect(dialog).toBeVisible()
    await dialog.getByLabel(/name/i).fill('Test Assistant 2')
    await dialog.getByRole('button', { name: /create/i }).click()

    // Wait for navigation to assistant details page
    await expect(page).toHaveURL(/\/assistants\/[^/]+$/)

    // Click language model dropdown
    const languageModelFieldset2 = page.locator('fieldset').filter({ hasText: /language model/i })
    const languageModelButton2 = languageModelFieldset2.getByRole('button', { name: /language model:/i })
    await languageModelButton2.scrollIntoViewIfNeeded()
    await languageModelButton2.click()

    // Wait for dropdown menu to appear - verify by checking for the listbox
    modelListbox = languageModelFieldset2.getByRole('listbox', { name: 'Available models' })
    await expect(modelListbox).toBeVisible()

    // Get all model option buttons in the dropdown
    const secondWorkspaceModels = modelListbox.getByRole('option')
    const secondCount = await secondWorkspaceModels.count()

    let secondOpenaiCount = 0
    let secondOllamaCount = 0

    for (let i = 0; i < secondCount; i++) {
      const modelText = await secondWorkspaceModels.nth(i).getAttribute('aria-label')
      if (
        modelText?.includes('openai') ||
        modelText?.toLowerCase().includes('gpt') ||
        modelText?.toLowerCase().includes('text-embedding-3')
      ) {
        secondOpenaiCount++
      }
      if (
        modelText?.includes('ollama') ||
        modelText?.toLowerCase().includes('llama') ||
        modelText?.toLowerCase().includes('mistral') ||
        modelText?.toLowerCase().includes('nomic') ||
        modelText?.toLowerCase().includes('mxbai') ||
        modelText?.toLowerCase().includes('qwen') ||
        modelText?.toLowerCase().includes('phi') ||
        modelText?.toLowerCase().includes('gemma') ||
        modelText?.toLowerCase().includes('bge')
      ) {
        secondOllamaCount++
      }
    }

    // Verify workspace 1 has OpenAI models, no Ollama
    expect(firstOpenaiCount).toBeGreaterThan(0)
    expect(firstOllamaCount).toBe(0)

    // Verify workspace 2 has Ollama models, no OpenAI
    expect(secondOllamaCount).toBeGreaterThan(0)
    expect(secondOpenaiCount).toBe(0)

    // Close dropdown
    await page.keyboard.press('Escape')
  })
})
