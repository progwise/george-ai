import { generateOllamaEmbeddings } from './ollama-api.js'
import { getOllamaResourceManager } from './ollama-resource-manager.js'

export const getOllamaEmbedding = async (workspaceId: string, embeddingModelName: string, question: string) => {
  // Get workspace resource manager and best instance for this model
  const manager = getOllamaResourceManager(workspaceId)
  const { instance, semaphore } = await manager.getBestInstance(embeddingModelName)

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
