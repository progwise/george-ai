import { getOllamaEmbedding } from './ollama'
import { getOpenAIEmbedding } from './openAi'

export const getEmbedding = async (embeddingModelProvider: string, embeddingModelName: string, question: string) => {
  if (embeddingModelProvider === 'ollama') {
    return getOllamaEmbedding(embeddingModelName, question)
  } else if (embeddingModelProvider === 'openai') {
    return getOpenAIEmbedding(embeddingModelName, question)
  } else {
    throw new Error(`Unsupported embedding model provider: ${embeddingModelProvider}`)
  }
}
