import { OllamaProviderConnection, OpenAiProviderConnection, encryptValue } from '@george-ai/app-commons'

import { statusReport } from './status-report'

const OLLAMA_BASE_URL = process.env['OLLAMA_BASE_URL']
const OLLAMA_API_KEY = process.env['OLLAMA_API_KEY']
const OPENAI_API_KEY = process.env['OPENAI_API_KEY']

describe.sequential('Testing status reports', () => {
  const ollamaConnection: OllamaProviderConnection | null = !OLLAMA_BASE_URL
    ? null
    : {
        modelProvider: 'ollama',
        baseUrl: OLLAMA_BASE_URL,
        encryptedApiKey: encryptValue(OLLAMA_API_KEY),
      }

  const openAIConnection: OpenAiProviderConnection | null = !OPENAI_API_KEY
    ? null
    : {
        modelProvider: 'openai',
        encryptedApiKey: encryptValue(OPENAI_API_KEY),
      }

  beforeAll(() => {})

  afterAll(() => {})

  it.skipIf(!ollamaConnection)('Should provide successful report for running OLLAMA instance', async () => {
    const report = await statusReport(ollamaConnection!)

    expect(report).toBeDefined()
    expect(report.isConnected).toBeTruthy()
    expect(report.connectionErrorMessage).toBeUndefined()
    expect(report.availableModelNames?.length).toBeGreaterThan(0)
  })

  it.skipIf(!openAIConnection)('Should provide successful report for running OPENAI instance', async () => {
    const report = await statusReport(openAIConnection!)

    expect(report).toBeDefined()
    expect(report.isConnected).toBeTruthy()
    expect(report.connectionErrorMessage).toBeUndefined()
    expect(report.availableModelNames?.length).toBeGreaterThan(0)
  })
})
