import { Message, ollamaChat } from '@george-ai/ai-service-client'
import { getSimilarChunks } from '@george-ai/langchain-chat'
import { Prisma } from '@george-ai/prismaClient'

import { EnrichmentMetadata, validateEnrichmentTaskForProcessing } from '../domain/enrichment'
import { prisma } from '../prisma'
import { callEnrichmentQueueUpdateSubscriptions } from '../subscriptions'

let isWorkerRunning = false
let workerInterval: NodeJS.Timeout | null = null

const WORKER_INTERVAL_MS = 2000 // Process queue every 2 seconds
const BATCH_SIZE = 5 // Process up to 5 items at a time
const MAX_CONCURRENT_ENRICHMENTS = 3 // Maximum concurrent getEnrichedValue calls

async function processQueueItem({
  enrichmentTask,
  metaData,
}: {
  enrichmentTask: Prisma.AiEnrichmentTaskGetPayload<object>
  metaData: EnrichmentMetadata
}) {
  try {
    // Mark as processing - use upsert to handle the case where item was deleted
    await prisma.aiEnrichmentTask.update({
      where: {
        id: enrichmentTask.id,
        status: 'pending', // Only update if still pending
      },
      data: {
        status: 'processing',
        startedAt: new Date(),
      },
    })

    // Send SSE update
    await callEnrichmentQueueUpdateSubscriptions({
      listId: enrichmentTask.listId,
      update: {
        queueItemId: enrichmentTask.id,
        listId: enrichmentTask.listId,
        fieldId: enrichmentTask.fieldId,
        fileId: enrichmentTask.fileId,
        status: 'processing',
      },
    })

    // Try to get enriched value, but handle errors gracefully
    let computedValue: string | null = null
    let enrichmentError: string | null = null
    const messages: Array<Message> = []

    const outputMetaData: EnrichmentMetadata['output'] = {
      messages: [],
      similarChunks: [],
      issues: [],
    }

    try {
      messages.push(
        ...metaData.input.contextFields.map((ctx) => ({
          role: 'user' as const,
          content: `Here is the context value for ${ctx.fieldName}: ${ctx.value}`,
        })),
      )

      if (metaData.input.useVectorStore) {
        if (!metaData.input.contentQuery || !metaData.input.libraryEmbeddingModel) {
          throw new Error(
            `Content query and library embedding model are required when using vector store. Validation should have caught this. Enrichment Task ID: ${enrichmentTask.id}`,
          )
        }
        const similarChunks = await getSimilarChunks({
          embeddingsModelName: metaData.input.libraryEmbeddingModel,
          term: metaData.input.contentQuery,
          libraryId: metaData.input.libraryId,
          hits: 4,
        })

        outputMetaData.similarChunks = similarChunks.map((chunk) => ({
          id: chunk.id,
          fileName: chunk.fileName,
          fileId: chunk.fileId,
          text: chunk.text,
          distance: chunk.distance,
        }))

        messages.push({
          role: 'user',
          content: `Here is the search result in the vector store:\n\n${similarChunks
            .map((chunk) => chunk.text)
            .join('\n\n')}`,
        })
      }

      messages.push({
        role: 'user',
        content: metaData.input.aiGenerationPrompt,
      })

      outputMetaData.messages = messages
      const chatResponse = await ollamaChat({
        messages,
        model: metaData.input.aiModel,
      })
      computedValue = chatResponse.content.trim()

      outputMetaData.aiInstance = chatResponse.metadata?.instanceUrl
      outputMetaData.enrichedValue = computedValue
      if (chatResponse.issues?.timeout) {
        outputMetaData.issues.push('timeout')
      }
      if (chatResponse.issues?.partialResult) {
        outputMetaData.issues.push('partialResult')
      }
      if (chatResponse.error) {
        outputMetaData.issues.push(`error: ${chatResponse.error}`)
      }

      console.log(`✅ Enrichment succeeded for item ${enrichmentTask.id}`)
    } catch (error) {
      enrichmentError = error instanceof Error ? error.message : 'Unknown enrichment error'
      console.warn(`⚠️ Enrichment failed for item ${enrichmentTask.id}: ${enrichmentError}`)
    }

    // Store the computed value or error in cache
    const cachedValue = await prisma.aiListItemCache.upsert({
      where: {
        fileId_fieldId: {
          fileId: enrichmentTask.fileId,
          fieldId: enrichmentTask.fieldId,
        },
      },
      create: {
        fileId: enrichmentTask.fileId,
        fieldId: enrichmentTask.fieldId,
        valueString: computedValue,
        valueNumber:
          metaData.input.dataType === 'number' ? (computedValue ? parseFloat(computedValue) || null : null) : null,
        valueBoolean:
          metaData.input.dataType === 'boolean'
            ? computedValue
              ? computedValue.toLowerCase() === 'true'
              : null
            : null,
        valueDate:
          metaData.input.dataType === 'date' || metaData.input.dataType === 'datetime'
            ? computedValue
              ? new Date(computedValue)
              : null
            : null,
        enrichmentErrorMessage: enrichmentError,
      },
      update: {
        valueString: computedValue,
        valueNumber:
          metaData.input.dataType === 'number' ? (computedValue ? parseFloat(computedValue) || null : null) : null,
        valueBoolean:
          metaData.input.dataType === 'boolean'
            ? computedValue
              ? computedValue.toLowerCase() === 'true'
              : null
            : null,
        valueDate:
          metaData.input.dataType === 'date' || metaData.input.dataType === 'datetime'
            ? computedValue
              ? new Date(computedValue)
              : null
            : null,
        enrichmentErrorMessage: enrichmentError,
      },
    })

    // Mark as completed - use updateMany to handle race conditions
    const completedItem = await prisma.aiEnrichmentTask.updateMany({
      where: {
        id: enrichmentTask.id,
        status: 'processing', // Only update if still processing
      },
      data: {
        status: 'completed',
        completedAt: new Date(),
        metadata: JSON.stringify({ ...metaData, output: outputMetaData }),
      },
    })

    // If no rows were updated, the item was likely deleted
    if (completedItem.count === 0) {
      console.log(`⚠️ Queue item ${enrichmentTask.id} no longer exists for completion, skipping`)
      return
    }

    // Send SSE update with computed value
    await callEnrichmentQueueUpdateSubscriptions({
      listId: enrichmentTask.listId,
      update: {
        queueItemId: enrichmentTask.id,
        listId: enrichmentTask.listId,
        fieldId: enrichmentTask.fieldId,
        fileId: enrichmentTask.fileId,
        status: 'completed',
        computedValue: {
          valueString: cachedValue.valueString,
          valueNumber: cachedValue.valueNumber,
          valueDate: cachedValue.valueDate,
          valueBoolean: cachedValue.valueBoolean,
          enrichmentErrorMessage: cachedValue.enrichmentErrorMessage,
        },
      },
    })

    console.log(`✅ Processed enrichment queue item ${enrichmentTask.id}`)
  } catch (error) {
    console.error(`❌ Error processing queue item ${enrichmentTask.id}:`, error)

    // Mark as failed - use updateMany to handle race conditions
    const failedItem = await prisma.aiEnrichmentTask.updateMany({
      where: {
        id: enrichmentTask.id,
        status: { in: ['pending', 'processing'] }, // Only update if not already completed/failed
      },
      data: {
        status: 'failed',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    // If no rows were updated, the item was likely deleted
    if (failedItem.count === 0) {
      console.log(`⚠️ Queue item ${enrichmentTask.id} no longer exists for failure update, skipping`)
      return
    }

    // Send SSE update
    await callEnrichmentQueueUpdateSubscriptions({
      listId: enrichmentTask.listId,
      update: {
        queueItemId: enrichmentTask.id,
        listId: enrichmentTask.listId,
        fieldId: enrichmentTask.fieldId,
        fileId: enrichmentTask.fileId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })
  }
}

async function processQueue() {
  if (!isWorkerRunning) return

  try {
    // Only get items if we have capacity
    const availableCapacity = MAX_CONCURRENT_ENRICHMENTS
    if (availableCapacity <= 0) {
      return
    }

    // Get pending items from the queue, limited by available capacity
    const queueItems = await prisma.aiEnrichmentTask.findMany({
      where: {
        status: 'pending',
      },
      orderBy: [{ priority: 'desc' }, { requestedAt: 'asc' }],
      take: Math.min(BATCH_SIZE, availableCapacity),
    })

    if (queueItems.length === 0) {
      return
    }

    console.log(`Processing ${queueItems.length} enrichment queue items... (capacity: ${availableCapacity})`)

    // Process items in parallel
    await Promise.all(
      queueItems.map((enrichmentTask) => {
        const validationResult = validateEnrichmentTaskForProcessing(enrichmentTask)
        if (!validationResult.success) {
          console.error(`❌ Validation failed for enrichment task ${enrichmentTask.id}: ${validationResult.error}`)
          // Mark as failed due to validation error
          return prisma.aiEnrichmentTask.update({
            where: { id: enrichmentTask.id },
            data: {
              status: 'failed',
              completedAt: new Date(),
              error: `Validation error: ${validationResult.error}`,
            },
          })
        } else {
          return processQueueItem({ enrichmentTask, metaData: validationResult.data })
        }
      }),
    )
  } catch (error) {
    console.error('❌ Error processing enrichment queue:', error)
  }
}

async function resetOrphanedProcessingItems() {
  try {
    // Reset any items that were stuck in "processing" status from previous server session
    const resetResult = await prisma.aiEnrichmentTask.updateMany({
      where: {
        status: 'processing',
      },
      data: {
        status: 'pending',
        startedAt: null,
      },
    })

    if (resetResult.count > 0) {
      console.log(`🔄 Reset ${resetResult.count} orphaned processing items back to pending`)
    }
  } catch (error) {
    console.error('Error resetting orphaned processing items:', error)
  }
}

export async function startEnrichmentQueueWorker() {
  if (isWorkerRunning) {
    console.log('Enrichment queue worker is already running')
    return
  }

  isWorkerRunning = true
  console.log('🚀 Starting enrichment queue worker...')

  // First, reset any orphaned processing items from previous server sessions
  await resetOrphanedProcessingItems()

  // Process queue immediately
  await processQueue()

  // Set up interval to process queue
  workerInterval = setInterval(async () => {
    await processQueue()
  }, WORKER_INTERVAL_MS)
}

export function stopEnrichmentQueueWorker() {
  if (!isWorkerRunning) {
    console.log('Enrichment queue worker is not running')
    return
  }

  isWorkerRunning = false

  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
  }

  console.log('🛑 Stopped enrichment queue worker')
}

export function isEnrichmentWorkerRunning(): boolean {
  return isWorkerRunning
}

// Note: The worker is started explicitly by the server in server.ts
// This ensures proper initialization order and error handling
