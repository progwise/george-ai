import { EmbeddingsResult, ProviderConnection, SupportedProvider } from './common'
import { ollamaApi } from './ollama'
import { openAiApi } from './openAi'

export const getEmbeddings = async (parameters: {
  modelProvider: SupportedProvider
  modelName: string
  textChunks: string[]
  connection: ProviderConnection
}): Promise<EmbeddingsResult> => {
  const { modelProvider, modelName, textChunks, connection } = parameters
  if (modelProvider === 'ollama') {
    if (!connection.providerBaseUrl) {
      throw new Error('Ollama providerBaseUrl is required in connection')
    }
    const result = await ollamaApi.generateOllamaEmbeddings(
      { apiUrl: connection.providerBaseUrl, apiKey: connection.providerApiKey },
      modelName,
      textChunks,
    )
    return {
      embeddings: result.embeddings.map((emb, index) => ({ inputText: textChunks[index], embedding: emb })),
      usage: result.usage,
    }
  } else if (modelProvider === 'openai') {
    if (!connection.providerApiKey) {
      throw new Error('OpenAI providerApiKey is required in connection')
    }
    const result = await openAiApi.generateOpenAIEmbeddings(
      { url: connection.providerBaseUrl, apiKey: connection.providerApiKey },
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
