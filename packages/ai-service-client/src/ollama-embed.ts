import { OllamaEmbeddings } from '@langchain/ollama'

import { ollamaResourceManager } from './ollama-resource-manager.js'

export const getOllamaEmbedding = async (embeddingModelName: string, question: string) => {
  // Get semaphore for this instance to throttle concurrent requests
  const { instance, semaphore } = await ollamaResourceManager.getBestInstance(embeddingModelName)

  // Acquire semaphore before making embedding request
  await semaphore.acquire()

  try {
    const embeddings = new OllamaEmbeddings({
      model: embeddingModelName,
      baseUrl: instance.config.url,
      headers: instance.config.apiKey ? { 'X-API-Key': instance.config.apiKey } : undefined,
      keepAlive: '5m',
    })

    return await embeddings.embedQuery(question)
  } finally {
    // Always release semaphore
    semaphore.release()
  }
}
