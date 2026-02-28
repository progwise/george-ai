import { createWorkspace } from './create-workspace'
import { existsWorkspace } from './exists-workspace'
import { findSimilarChunks } from './find-similar-chunks'
import { getChunkCount } from './get-chunk-count'
import { getChunks } from './get-chunks'
import { getEmbeddingModelNames } from './get-embedding-model-names'
import { type EmbeddingStatistic, getEmbeddingStatistics } from './get-embedding-statistics'
import { getWorkspace } from './get-workspace'
import { queryChunks } from './query-chunks'
import { readChunks } from './read-chunks'
import { removeChunks } from './remove-chunks'
import { removeEmbeddings } from './remove-embeddings'
import { removeWorkspace } from './remove-workspace'
import { upsertChunks } from './upsert-chunks'
import { upsertEmbeddings } from './upsert-embeddings'

export type { EmbeddingStatistic }
export default {
  createWorkspace,
  existsWorkspace,
  getWorkspace,
  removeWorkspace,
  getEmbeddingModelNames,
  getEmbeddingStatistics,
  getChunkCount,
  upsertChunks,
  removeChunks,
  getChunks,
  readChunks,
  upsertEmbeddings,
  removeEmbeddings,
  findSimilarChunks,
  queryChunks,
}

export {
  createWorkspace,
  existsWorkspace,
  getWorkspace,
  removeWorkspace,
  getEmbeddingModelNames,
  getEmbeddingStatistics,
  getChunkCount,
  upsertChunks,
  removeChunks,
  getChunks,
  readChunks,
  upsertEmbeddings,
  removeEmbeddings,
  findSimilarChunks,
  queryChunks,
}
