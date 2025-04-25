import { Document } from 'langchain/document'

export const MIN_CHUNK_SIZE = 500
export const MAX_CHUNK_SIZE = 2000
export const OVERLAP_RATIO = 0.1

export const calculateChunkParams = (documents: Document[]) => {
  const totalLength = documents.reduce((sum, doc) => sum + doc.pageContent.length, 0)
  const avgLength = totalLength / documents.length
  const chunkSize = Math.round(Math.min(MAX_CHUNK_SIZE, Math.max(MIN_CHUNK_SIZE, avgLength)))
  const chunkOverlap = Math.round(chunkSize * OVERLAP_RATIO)
  return { chunkSize, chunkOverlap }
}
