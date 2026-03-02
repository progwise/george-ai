import { ProviderConnection } from '@george-ai/app-commons'

import { TestResult, logger } from './common'
import { getOllamaVersion } from './ollama'
import { getOpenAIModels } from './openAi'

export const testConnection = async (connection: ProviderConnection): Promise<TestResult> => {
  const abortController = new AbortController()
  switch (connection.modelProvider) {
    case 'ollama':
      return await getOllamaVersion(connection, abortController.signal)
        .then(() => ({ success: true }))
        .catch(() => ({ success: false }))
    case 'openai':
      return await getOpenAIModels(connection, abortController.signal)
        .then(() => ({ success: true }))
        .catch(() => ({ success: false }))
    default:
      logger.error('Cannot test connection', connection)
      throw new Error(`Test connection not implemented for model provider`)
  }
}
