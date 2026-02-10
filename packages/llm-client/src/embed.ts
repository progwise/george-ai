import { ModelProvider, ProviderConnection } from '@george-ai/app-commons'

import { EmbeddingsResult } from './common'
import { ollamaApi } from './ollama'
import { openAiApi } from './openAi'

export const getEmbeddings = async (parameters: {
  modelProvider: ModelProvider
  modelName: string
  textChunks: string[]
  connection: ProviderConnection
}): Promise<EmbeddingsResult> => {
  const { modelProvider, modelName, textChunks, connection } = parameters
  const { baseUrl, apiKey } = connection
  if (modelProvider === 'ollama') {
    if (!baseUrl) {
      throw new Error('Ollama providerBaseUrl is required in connection')
    }
    const result = await ollamaApi.generateOllamaEmbeddings({ baseUrl, apiKey }, modelName, textChunks)
    return {
      embeddings: result.embeddings.map((emb, index) => ({ inputText: textChunks[index], embedding: emb })),
      usage: result.usage,
    }
  } else if (modelProvider === 'openai') {
    if (!apiKey) {
      throw new Error('OpenAI providerApiKey is required in connection')
    }
    const result = await openAiApi.generateOpenAIEmbeddings(
      { baseUrl, apiKey },

      modelName,
      textChunks,
    )
    return {
      embeddings: result.embeddings.map((emb, index) => ({ inputText: textChunks[index], embedding: emb })),
      usage: result.usage,
    }
  } else {
    throw new Error(`Unsupported embedding model provider: ${modelProvider}`)
  }
}
