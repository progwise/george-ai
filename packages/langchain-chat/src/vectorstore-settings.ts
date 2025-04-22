import { Document } from 'langchain/document'

const minChunkSize = 500
const maxChunkSize = 2000
const overlapRatio = 0.1
const linearRetrievalThreshold = 10

export const calculateChunkParams = (documents: Document[]): { chunkSize: number; chunkOverlap: number } => {
  const totalLength = documents.reduce((sum, doc) => sum + doc.pageContent.length, 0)
  const avgLength = totalLength / documents.length
  const chunkSize = Math.round(Math.min(maxChunkSize, Math.max(minChunkSize, avgLength)))
  const chunkOverlap = Math.round(chunkSize * overlapRatio)
  return { chunkSize, chunkOverlap }
}

export const calculateRetrievalK = (totalChunks: number): number => {
  return totalChunks <= linearRetrievalThreshold ? totalChunks : Math.ceil(Math.sqrt(totalChunks))
}
