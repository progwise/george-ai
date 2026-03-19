import { createVectorStore } from './create'
import { existsVectorStore } from './exists'
import { findSimilarChunks } from './find-similar-chunks'
import { getVectorStore } from './get'
import { getChunkCount } from './get-chunk-count'
import { getChunks } from './get-chunks'
import { type EmbeddingStatistic, getEmbeddingStatistics } from './get-embedding-statistics'
import { queryChunks } from './query-chunks'
import { readChunks } from './read-chunks'
import { removeVectorStore } from './remove'
import { removeChunks } from './remove-chunks'
import { upsertChunks } from './upsert-chunks'
import { upsertEmbeddings } from './upsert-embeddings'

export type { EmbeddingStatistic }
export default {
  createVectorStore,
  existsVectorStore,
  getVectorStore,
  removeVectorStore,
  getEmbeddingStatistics,
  getChunkCount,
  upsertChunks,
  removeChunks,
  getChunks,
  readChunks,
  upsertEmbeddings,
  findSimilarChunks,
  queryChunks,
}

export {
  createVectorStore,
  existsVectorStore,
  getVectorStore,
  removeVectorStore,
  getEmbeddingStatistics,
  getChunkCount,
  upsertChunks,
  removeChunks,
  getChunks,
  readChunks,
  upsertEmbeddings,
  findSimilarChunks,
  queryChunks,
}
