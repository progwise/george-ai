import { generateOllamaEmbeddings } from './ollama-api.js'
import { ollamaResourceManager } from './ollama-resource-manager.js'

export const getOllamaEmbedding = async (embeddingModelName: string, question: string) => {
  // Get semaphore for this instance to throttle concurrent requests
  const { instance, semaphore } = await ollamaResourceManager.getBestInstance(embeddingModelName)

  // Acquire semaphore before making embedding request
  await semaphore.acquire()

  try {
    const vector = await generateOllamaEmbeddings(instance.config, embeddingModelName, question)
    return vector
  } finally {
    // Always release semaphore
    semaphore.release()
  }
}
