import { ProviderConnection, SupportedProvider, TestResult, logger } from './common'
import { ollamaApi } from './ollama'
import { openAiApi } from './openAi'

export const testConnection = async (parameters: {
  modelProvider: SupportedProvider
  connection: ProviderConnection
}): Promise<TestResult> => {
  const { modelProvider, connection } = parameters
  if (modelProvider === 'ollama') {
    if (!connection.providerBaseUrl) {
      return { success: false, errorMessage: 'Ollama providerBaseUrl is required in connection' }
    }
    try {
      const result = await ollamaApi.getOllamaVersion({
        apiUrl: connection.providerBaseUrl,
        apiKey: connection.providerApiKey,
      })
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
    if (!connection.providerApiKey) {
      return { success: false, errorMessage: 'OpenAI providerApiKey is required in connection' }
    }
    try {
      const result = await openAiApi.getOpenAIModels({
        url: connection.providerBaseUrl,
        apiKey: connection.providerApiKey,
      })
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
