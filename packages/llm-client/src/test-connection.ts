import { InferenceHostConnection } from '@george-ai/app-schema'

import { logger } from './common'
import { getOllamaVersion } from './ollama'
import { getOpenAIModels } from './openAi'

export const testConnection = async (connection: InferenceHostConnection): Promise<{ success: boolean }> => {
  const abortController = new AbortController()
  switch (connection.driver) {
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
