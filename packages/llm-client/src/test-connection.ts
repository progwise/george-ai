import { ModelProvider, ProviderConnection } from '@george-ai/app-commons'

import { TestResult, logger } from './common'
import { ollamaApi } from './ollama'
import { openAiApi } from './openAi'

export const testConnection = async (parameters: {
  modelProvider: ModelProvider
  connection: ProviderConnection
}): Promise<TestResult> => {
  const { modelProvider, connection } = parameters
  const { baseUrl, encryptedApiKey } = connection
  if (modelProvider === 'ollama') {
    if (!baseUrl) {
      return { success: false, errorMessage: 'Ollama providerBaseUrl is required in connection' }
    }
    try {
      const result = await ollamaApi.getOllamaVersion({ baseUrl, encryptedApiKey })
      logger.debug('Successfully connected to Provider Instance', {
        modelProvider,
        connection,
        version: result.version,
      })
      return { success: true }
    } catch (error) {
      logger.warn('Failed to connect to Ollama instance', { modelProvider, connection, error })
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Ollama instance'
      return { success: false, errorMessage: errorMessage }
    }
  } else if (modelProvider === 'openai') {
    if (!encryptedApiKey) {
      return { success: false, errorMessage: 'OpenAI apiKey is required in connection' }
    }
    try {
      const result = await openAiApi.getOpenAIModels({ baseUrl, encryptedApiKey })
      logger.debug('Successfully connected to Provider Instance', {
        modelProvider,
        connection,
        modelCount: result.data.length,
      })
      return { success: true }
    } catch (error) {
      logger.warn('Failed to connect to OpenAI API', { modelProvider, connection, error })
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to OpenAI API'
      return { success: false, errorMessage: errorMessage }
    }
  } else {
    logger.error('Unsupported model provider in testConnection', { modelProvider, connection })
    return { success: false, errorMessage: `Unsupported model provider: ${modelProvider}` }
  }
}
