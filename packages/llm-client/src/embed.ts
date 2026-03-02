import { ProviderConnection } from '@george-ai/app-commons'

import { EmbeddingsResult, logger } from './common'
import { generateOllamaEmbeddings } from './ollama'
import { generateOpenAIEmbeddings } from './openAi'

export const getEmbeddings = async (parameters: {
  modelName: string
  textChunks: string[]
  connection: ProviderConnection
}): Promise<EmbeddingsResult> => {
  const { modelName, textChunks, connection } = parameters

  switch (connection.modelProvider) {
    case 'ollama':
      return await generateOllamaEmbeddings(connection, modelName, textChunks)
    case 'openai':
      return await generateOpenAIEmbeddings(connection, modelName, textChunks)
    default:
      logger.error('getEmbeddings for model type not implemented', connection)
      throw new Error('getEmbeddings for model type not implemented')
  }
}
