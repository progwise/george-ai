import { OllamaEmbeddings } from '@langchain/ollama'

import { ollamaResourceManager } from './ollama-resource-manager.js'

export const getOllamaEmbedding = async (embeddingModelName: string, question: string) => {
  // Select best OLLAMA instance based on current GPU memory usage
  const { instance } = await ollamaResourceManager.selectBestInstance()

  // Get semaphore for this instance to throttle concurrent requests
  const semaphore = await ollamaResourceManager.getSemaphore(instance.url)

  // Acquire semaphore before making embedding request
  await semaphore.acquire()

  try {
    const embeddings = new OllamaEmbeddings({
      model: embeddingModelName,
      baseUrl: instance.url,
      headers: instance.apiKey ? { 'X-API-Key': instance.apiKey } : undefined,
      keepAlive: '5m',
    })

    return await embeddings.embedQuery(question)
  } finally {
    // Always release semaphore
    semaphore.release()

    // Optionally refresh semaphore limits based on current GPU memory
    ollamaResourceManager.refreshSemaphore(instance.url).catch((error) => {
      console.warn('Failed to refresh semaphore limits:', error)
    })
  }
}
