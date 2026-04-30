import { EmbeddingResult, InferenceHostConnection } from '@george-ai/app-schema'

import { logger } from './common'
import { generateOllamaEmbeddings } from './ollama'
import { generateOpenAIEmbeddings } from './openAi'

export const getEmbeddings = async (parameters: {
  modelName: string
  textChunks: string[]
  connection: InferenceHostConnection
}): Promise<EmbeddingResult> => {
  const { modelName, textChunks, connection } = parameters

  switch (connection.driver) {
    case 'ollama':
      return await generateOllamaEmbeddings(connection, modelName, textChunks)
    case 'openai':
      return await generateOpenAIEmbeddings(connection, modelName, textChunks)
    default:
      logger.error('getEmbeddings for model type not implemented', connection)
      throw new Error('getEmbeddings for model type not implemented')
  }
}
