/**
 * Domain logic for content extraction task tags (achievement/milestone filtering)
 */

/**
 * Task achievement/milestone tags
 */
export const TASK_TAGS = [
  // Initial states
  'Waiting', // Task created but not yet picked up by worker
  'Processing', // Worker is actively working on task (any phase)

  // Validation
  'ValidationPassed',
  'ValidationFailed',

  // Extraction
  'ExtractionStarted',
  'ExtractionFinished',
  'ExtractionPartial',
  'ExtractionFailed',
  'ExtractionTimeout',

  // Embedding
  'EmbeddingStarted',
  'EmbeddingFinished',
  'EmbeddingPartial',
  'EmbeddingFailed',
  'EmbeddingTimeout',
  'EmbeddingSkipped',

  // Content status
  'HasContent',
  'NoContent',
  'ContentSearchable',
  'ContentNotSearchable',
  'ReadyForUse',
  'NeedsAttention',
] as const
export type TaskTag = (typeof TASK_TAGS)[number]

/**
 * Gets the Prisma where clause for a single tag
 */
function getSingleTagWhereClause(tag: TaskTag) {
  switch (tag) {
    case 'Waiting':
      return {
        extractionStartedAt: null,
      }

    case 'Processing':
      return {
        validationFailedAt: null, // Exclude validation failures
        OR: [
          // Extraction phase active
          {
            extractionStartedAt: { not: null },
            extractionFinishedAt: null,
            extractionFailedAt: null,
            extractionTimeoutAt: null,
          },
          // Embedding phase active
          {
            embeddingStartedAt: { not: null },
            embeddingFinishedAt: null,
            embeddingFailedAt: null,
            embeddingTimeoutAt: null,
            embeddingSkippedAt: null,
          },
        ],
      }

    case 'ValidationPassed':
      return {
        validationFailedAt: null,
        extractionStartedAt: { not: null },
      }

    case 'ValidationFailed':
      return {
        validationFailedAt: { not: null },
      }

    case 'ExtractionStarted':
      return {
        extractionStartedAt: { not: null },
      }

    case 'ExtractionFinished':
      return {
        extractionFinishedAt: { not: null },
      }

    case 'ExtractionPartial':
      return {
        extractionPartiallyFinishedAt: { not: null },
      }

    case 'ExtractionFailed':
      return {
        extractionFailedAt: { not: null },
      }

    case 'ExtractionTimeout':
      return {
        extractionTimeoutAt: { not: null },
      }

    case 'EmbeddingStarted':
      return {
        embeddingStartedAt: { not: null },
      }

    case 'EmbeddingFinished':
      return {
        embeddingFinishedAt: { not: null },
      }

    case 'EmbeddingPartial':
      return {
        embeddingPartiallyFinishedAt: { not: null },
      }

    case 'EmbeddingFailed':
      return {
        embeddingFailedAt: { not: null },
      }

    case 'EmbeddingTimeout':
      return {
        embeddingTimeoutAt: { not: null },
      }

    case 'EmbeddingSkipped':
      return {
        embeddingSkippedAt: { not: null },
      }

    case 'HasContent':
      return {
        extractionFinishedAt: { not: null },
        embeddingSkippedAt: null, // Was not skipped = had content
      }

    case 'NoContent':
      return {
        embeddingSkippedAt: { not: null },
      }

    case 'ContentSearchable':
      return {
        embeddingFinishedAt: { not: null },
      }

    case 'ContentNotSearchable':
      return {
        extractionFinishedAt: { not: null },
        embeddingSkippedAt: null,
        embeddingFinishedAt: null,
      }

    case 'ReadyForUse':
      return {
        OR: [{ embeddingFinishedAt: { not: null } }, { embeddingSkippedAt: { not: null } }],
      }

    case 'NeedsAttention':
      return {
        OR: [
          { validationFailedAt: { not: null } },
          { extractionFailedAt: { not: null } },
          { extractionTimeoutAt: { not: null } },
          { embeddingFailedAt: { not: null } },
          { embeddingTimeoutAt: { not: null } },
        ],
      }

    default:
      throw new Error(`Task tag not implemented: ${tag}`)
  }
}

/**
 * Gets the Prisma where clause for filtering tasks by tags (OR logic)
 * More tags = more tasks returned (less restrictive)
 */
export function getTagWhereClause(tags: TaskTag[]) {
  if (tags.length === 0) {
    return {}
  }

  if (tags.length === 1) {
    return getSingleTagWhereClause(tags[0])
  }

  // Multiple tags: OR them together
  return {
    OR: tags.map((tag) => getSingleTagWhereClause(tag)),
  }
}
