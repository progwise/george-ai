import { Prisma } from '@george-ai/prismaClient'

import { ProcessingStatus } from './types'

/**
 * Domain logic for content extraction task status filtering (exact state matching)
 */

/**
 * Gets the Prisma where clause for filtering tasks by status
 */
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
