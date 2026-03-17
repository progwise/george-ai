import { InferenceHostConnection, InferenceModelBase } from '@george-ai/app-schema'

import { getModelCapabilities } from './capabilities'
import { logger } from './common'
import { getOllamaModels } from './ollama'
import { getOpenAIModels } from './openAi'

export async function availableModels(connection: InferenceHostConnection): Promise<InferenceModelBase[]> {
  const modelProviderInfo = `provider ${connection.driver} instance ${connection.baseUrl}`
  switch (connection.driver) {
    case 'ollama': {
      const result = await getOllamaModels(connection)

      return result.models.map((model) => {
        const capabilities = getModelCapabilities(model.name)
        return {
          modelName: model.name,
          modelDriver: 'ollama',
          canDoEmbedding: capabilities.includes('embedding'),
          canDoChatCompletion: capabilities.includes('chatCompletion'),
          canDoVision: capabilities.includes('vision'),
          canDoFunctionCalling: capabilities.includes('functionCalling'),
          version: 1,
        }
      })
    }
    case 'openai': {
      const result = await getOpenAIModels(connection)
      return result.data.map((model) => {
        const capabilities = getModelCapabilities(model.id)
        return {
          modelName: model.id,
          modelDriver: 'openai',
          canDoEmbedding: capabilities.includes('embedding'),
          canDoChatCompletion: capabilities.includes('chatCompletion'),
          canDoVision: capabilities.includes('vision'),
          canDoFunctionCalling: capabilities.includes('functionCalling'),
          version: 1,
        }
      })
    }
    default:
      logger.error('Model discovery not implemented for provider:', { connection })
      throw new Error(`Model discovery not implemented for ${modelProviderInfo}`)
  }
}
