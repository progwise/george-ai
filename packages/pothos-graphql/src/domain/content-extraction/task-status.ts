import { Prisma } from '@george-ai/prismaClient'

import { ContentExtractionTask } from '../types'

export const PROCESSING_STATUS = [
  'none',
  'pending',
  'validating',
  'validationFailed',
  'extracting',
  'extractionFailed',
  'extractionFinished',
  'embedding',
  'embeddingFailed',
  'embeddingFinished',
  'completed',
  'timedOut',
  'failed',
] as const
export type ProcessingStatus = (typeof PROCESSING_STATUS)[number]

export const EXTRACTION_STATUS = ['pending', 'running', 'completed', 'failed', 'skipped', 'none'] as const
export type ExtractionStatus = (typeof EXTRACTION_STATUS)[number]

export const EMBEDDING_STATUS = ['pending', 'running', 'completed', 'failed', 'skipped', 'none'] as const
export type EmbeddingStatus = (typeof EMBEDDING_STATUS)[number]

export const getExtractionStatus = (task: ContentExtractionTask | null): ExtractionStatus => {
  if (!task) return 'none'
  if (task.extractionFailedAt) return 'failed'
  if (task.extractionFinishedAt) return 'completed'
  if (task.extractionStartedAt) return 'running'
  if (task.embeddingStartedAt) return 'skipped'
  if (task.processingFailedAt || task.processingFinishedAt) return 'skipped'
  return 'pending'
}

export const getEmbeddingStatus = (task: ContentExtractionTask | null): EmbeddingStatus => {
  if (!task) return 'none'
  if (task.embeddingFailedAt) return 'failed'
  if (task.embeddingFinishedAt) return 'completed'
  if (task.embeddingStartedAt) return 'running'
  if (task.processingFailedAt || task.processingFinishedAt) return 'skipped'
  return 'pending'
}

export const getProcessingStatus = (task: ContentExtractionTask | null): ProcessingStatus => {
  if (!task) return 'none'
  if (task.processingTimeout) return 'timedOut'
  if (task.processingFailedAt) return 'failed'
  if (task.processingFinishedAt) return 'completed'
  if (task.embeddingStartedAt) {
    if (task.embeddingFailedAt) return 'embeddingFailed'
    if (task.embeddingFinishedAt) return 'embeddingFinished'
    return 'embedding'
  }
  if (task.extractionStartedAt) {
    if (task.extractionFailedAt) return 'extractionFailed'
    if (task.extractionFinishedAt) return 'extractionFinished'
    return 'extracting'
  }
  if (task.processingStartedAt) {
    if (task.processingFailedAt) return 'validationFailed'
    return 'validating'
  }
  return 'pending'
}

export function getTaskStatusWhereClause(status: ProcessingStatus): Prisma.AiFileContentExtractionTaskWhereInput {
  switch (status) {
    case 'pending':
      return {
        processingStartedAt: null,
      }

    case 'validating':
      return {
        processingStartedAt: { not: null },
        processingFinishedAt: null,
        processingFailedAt: null,
        extractionStartedAt: null,
        embeddingStartedAt: null,
      }

    case 'validationFailed':
      return {
        processingFailedAt: { not: null },
        extractionStartedAt: null,
        embeddingStartedAt: null,
      }

    case 'extracting':
      return {
        extractionStartedAt: { not: null },
        extractionFinishedAt: null,
        extractionFailedAt: null,
      }

    case 'extractionFailed':
      return {
        extractionStartedAt: { not: null },
        extractionFailedAt: { not: null },
      }
    case 'extractionFinished':
      return {
        extractionFinishedAt: { not: null },
      }
    case 'embedding':
      return {
        embeddingStartedAt: { not: null },
        embeddingFinishedAt: null,
        embeddingFailedAt: null,
      }
    case 'embeddingFailed':
      return {
        embeddingFailedAt: { not: null },
      }
    case 'embeddingFinished':
      return {
        embeddingFinishedAt: { not: null },
      }
    case 'completed':
      return {
        processingFinishedAt: { not: null },
      }
    case 'timedOut':
      return {
        processingTimeout: true,
      }
    case 'failed':
      return {
        processingFailedAt: { not: null },
      }

    default:
      throw new Error(`Task status not implemented: ${status}`)
  }
}
