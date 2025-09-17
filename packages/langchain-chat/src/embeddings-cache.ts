import { getOllamaEmbedding } from '@george-ai/ai-service-client'

interface EmbeddingsCacheEntry {
  embeddingModelName: string
  question: string
  vector: number[]
  lastAccessDate: Date
}

// Internal cache storage
const cache = new Map<string, EmbeddingsCacheEntry>()
const MAX_CACHE_SIZE = 1000

const getCacheKey = (embeddingModelName: string, question: string): string => {
  return `${embeddingModelName}:${question}`
}

const evictLRU = (): void => {
  if (cache.size < MAX_CACHE_SIZE) {
    return
  }

  // Sort entries by last access date (oldest first) and remove the first
  const sortedEntries = Array.from(cache.entries()).sort(
    (a, b) => a[1].lastAccessDate.getTime() - b[1].lastAccessDate.getTime(),
  )

  const [keyToRemove] = sortedEntries[0]
  cache.delete(keyToRemove)
  console.log(`Evicted LRU embedding from cache: ${keyToRemove.substring(0, 50)}...`)
}

export const getEmbeddingWithCache = async (embeddingModelName: string, question?: string): Promise<number[]> => {
  if (!question) {
    return []
  }
  const cacheKey = getCacheKey(embeddingModelName, question)
  const entry = cache.get(cacheKey)

  if (entry) {
    // Update last access time
    entry.lastAccessDate = new Date()
    return entry.vector
  }

  // Not in cache, compute the embedding
  console.log(`Embeddings cache miss for: ${cacheKey.substring(0, 50)}...`)
  const embeddingsResult = await getOllamaEmbedding(embeddingModelName, question)

  if (embeddingsResult.embeddings.length === 0) {
    throw new Error('No embeddings returned from Ollama')
  }

  const vector = embeddingsResult.embeddings[0]
  // Evict LRU if we're at max capacity
  if (cache.size >= MAX_CACHE_SIZE) {
    evictLRU()
  }

  // Add to cache
  cache.set(cacheKey, {
    embeddingModelName,
    question,
    vector,
    lastAccessDate: new Date(),
  })

  console.log(`Added to embeddings cache (size: ${cache.size}/${MAX_CACHE_SIZE})`)

  return vector
}
