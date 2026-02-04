import { VectorStore } from '../interface'
import { createWorkspace } from './create-workspace'
import { existsWorkspace } from './exists-workspace'
import { findSimilarChunks } from './find-similar-chunks'
import { getChunkCount } from './get-chunk-count'
import { getChunks } from './get-chunks'
import { getEmbeddingInfo } from './get-embedding-info'
import { getEmbeddingModelNames } from './get-embedding-model-names'
import { queryChunks } from './query-chunks'
import { readChunks } from './read-chunks'
import { removeChunks } from './remove-chunks'
import { removeEmbeddings } from './remove-embeddings'
import { removeWorkspace } from './remove-workspace'
import { upsertChunks } from './upsert-chunks'
import { upsertEmbeddings } from './upsert-embeddings'

export default {
  createWorkspace,
  existsWorkspace,
  removeWorkspace,
  getEmbeddingModelNames,
  getEmbeddingInfo,
  getChunkCount,
  upsertChunks,
  removeChunks,
  getChunks,
  readChunks,
  upsertEmbeddings,
  removeEmbeddings,
  findSimilarChunks,
  queryChunks,
} as VectorStore
