import { generateOllamaEmbeddings } from './ollama-api.js'
import { ollamaResourceManager } from './ollama-resource-manager.js'

export const getOllamaEmbedding = async (
  embeddingModelName: string,
  question: string,
  endpoints: { url: string; apiKey?: string; vramGB: number; name: string }[],
) => {
  // Get semaphore for this instance to throttle concurrent requests
  const { instance, semaphore } = await ollamaResourceManager.getBestInstance(endpoints, embeddingModelName)

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
