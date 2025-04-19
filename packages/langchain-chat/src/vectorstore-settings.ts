import { Document } from 'langchain/document'

export interface AdaptiveRetrievalConfig {
  minChunkSize: number
  maxChunkSize: number
  overlapRatio: number
  linearRetrievalThreshold: number
  typesenseConnectionTimeout: number
  typesenseNumRetries: number
  embeddingDimensions: number
}

export const DEFAULT_ADAPTIVE_CONFIG: AdaptiveRetrievalConfig = {
  minChunkSize: 500,
  maxChunkSize: 2000,
  overlapRatio: 0.1,
  linearRetrievalThreshold: 10,
  typesenseConnectionTimeout: 60,
  typesenseNumRetries: 3,
  embeddingDimensions: 3072,
}

export const calculateChunkParams = (
  documents: Document[],
  config: AdaptiveRetrievalConfig = DEFAULT_ADAPTIVE_CONFIG,
): { chunkSize: number; chunkOverlap: number } => {
  const { minChunkSize, maxChunkSize, overlapRatio } = config
  const totalLength = documents.reduce((sum, doc) => sum + doc.pageContent.length, 0)
  const avgLength = totalLength / documents.length
  const chunkSize = Math.round(Math.min(maxChunkSize, Math.max(minChunkSize, avgLength)))
  const chunkOverlap = Math.round(chunkSize * overlapRatio)
  return { chunkSize, chunkOverlap }
}

export const calculateRetrievalK = (
  totalChunks: number,
  config: AdaptiveRetrievalConfig = DEFAULT_ADAPTIVE_CONFIG,
): number => {
  const { linearRetrievalThreshold } = config
  return totalChunks <= linearRetrievalThreshold ? totalChunks : Math.ceil(Math.sqrt(totalChunks))
}
