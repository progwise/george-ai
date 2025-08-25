import { getEnrichedValue } from '@george-ai/langchain-chat'

import { getFieldValue } from '../domain'
import { prisma } from '../prisma'
import { callEnrichmentQueueUpdateSubscriptions } from '../subscriptions'

let isWorkerRunning = false
let workerInterval: NodeJS.Timeout | null = null

const WORKER_INTERVAL_MS = 2000 // Process queue every 2 seconds
const BATCH_SIZE = 5 // Process up to 5 items at a time
const MAX_CONCURRENT_ENRICHMENTS = 3 // Maximum concurrent getEnrichedValue calls

// Track concurrent enrichment calls
let currentEnrichmentCalls = 0

// Throttled wrapper for getEnrichedValue
async function throttledGetEnrichedValue(params: Parameters<typeof getEnrichedValue>[0]): Promise<string> {
  currentEnrichmentCalls++
  try {
    return await getEnrichedValue(params)
  } finally {
    currentEnrichmentCalls--
  }
}

async function processQueueItem(queueItem: {
  id: string
  listId: string
  fieldId: string
  fileId: string
  status: string
}) {
  try {
    // Mark as processing - use upsert to handle the case where item was deleted
    const updatedItem = await prisma.aiListEnrichmentQueue.updateMany({
      where: {
        id: queueItem.id,
        status: 'pending', // Only update if still pending
      },
      data: {
        status: 'processing',
        startedAt: new Date(),
      },
    })

    // If no rows were updated, the item was likely deleted or already processed
    if (updatedItem.count === 0) {
      console.log(`⚠️ Queue item ${queueItem.id} no longer exists or is not pending, skipping`)
      return
    }

    // Send SSE update
    await callEnrichmentQueueUpdateSubscriptions({
      listId: queueItem.listId,
      update: {
        queueItemId: queueItem.id,
        listId: queueItem.listId,
        fieldId: queueItem.fieldId,
        fileId: queueItem.fileId,
        status: 'processing',
      },
    })

    // Get field details
    const field = await prisma.aiListField.findUnique({
      include: { context: { include: { contextField: true } } },
      where: { id: queueItem.fieldId },
    })

    if (!field) {
      throw new Error('Field not found')
    }

    // Get file details
    const file = await prisma.aiLibraryFile.findUnique({
      where: { id: queueItem.fileId },
      include: {
        crawledByCrawler: true,
        cache: true,
        library: true,
      },
    })

    if (!file) {
      throw new Error('File not found')
    }

    // Get actual values for context fields
    const contextWithValues = await Promise.all(
      field.context.map(async (item) => {
        // Get cached value if this is a computed field
        let cachedValue = null
        if (item.contextField.sourceType === 'llm_computed') {
          cachedValue = await prisma.aiListItemCache.findUnique({
            where: {
              fileId_fieldId: {
                fileId: queueItem.fileId,
                fieldId: item.contextFieldId,
              },
            },
          })
        }

        const { value } = await getFieldValue(file, item.contextField, cachedValue)
        return {
          name: item.contextField.name,
          value: value || '',
        }
      }),
    )

    if (!file.library.embeddingModelName) {
      throw new Error('Embedding Model for Library not set, enrichment is not possible')
    }

    // Try to get enriched value, but handle errors gracefully
    let computedValue: string | null = null
    let enrichmentError: string | null = null

    try {
      computedValue = await throttledGetEnrichedValue({
        file: { ...file, embeddingModelName: file.library.embeddingModelName },
        languageModel: field.languageModel,
        instruction: field.prompt,
        context: contextWithValues,
        options: {
          useVectorStore: field.useVectorStore || false,
          contentQuery: field.contentQuery,
        },
      })
    } catch (error) {
      enrichmentError = error instanceof Error ? error.message : 'Unknown enrichment error'
      console.warn(`⚠️ Enrichment failed for item ${queueItem.id}: ${enrichmentError}`)
    }

    // Store the computed value or error in cache
    const cachedValue = await prisma.aiListItemCache.upsert({
      where: {
        fileId_fieldId: {
          fileId: queueItem.fileId,
          fieldId: queueItem.fieldId,
        },
      },
      create: {
        fileId: queueItem.fileId,
        fieldId: queueItem.fieldId,
        valueString: field.type === 'string' ? computedValue : null,
        valueNumber: field.type === 'number' ? (computedValue ? parseFloat(computedValue) || null : null) : null,
        valueBoolean: field.type === 'boolean' ? (computedValue ? computedValue.toLowerCase() === 'true' : null) : null,
        valueDate:
          field.type === 'date' || field.type === 'datetime' ? (computedValue ? new Date(computedValue) : null) : null,
        enrichmentErrorMessage: enrichmentError,
      },
      update: {
        valueString: field.type === 'string' ? computedValue : null,
        valueNumber: field.type === 'number' ? (computedValue ? parseFloat(computedValue) || null : null) : null,
        valueBoolean: field.type === 'boolean' ? (computedValue ? computedValue.toLowerCase() === 'true' : null) : null,
        valueDate:
          field.type === 'date' || field.type === 'datetime' ? (computedValue ? new Date(computedValue) : null) : null,
        enrichmentErrorMessage: enrichmentError,
      },
    })

    // Mark as completed - use updateMany to handle race conditions
    const completedItem = await prisma.aiListEnrichmentQueue.updateMany({
      where: {
        id: queueItem.id,
        status: 'processing', // Only update if still processing
      },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    })

    // If no rows were updated, the item was likely deleted
    if (completedItem.count === 0) {
      console.log(`⚠️ Queue item ${queueItem.id} no longer exists for completion, skipping`)
      return
    }

    // Send SSE update with computed value
    await callEnrichmentQueueUpdateSubscriptions({
      listId: queueItem.listId,
      update: {
        queueItemId: queueItem.id,
        listId: queueItem.listId,
        fieldId: queueItem.fieldId,
        fileId: queueItem.fileId,
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

    console.log(`✅ Processed enrichment queue item ${queueItem.id}`)
  } catch (error) {
    console.error(`❌ Error processing queue item ${queueItem.id}:`, error)

    // Mark as failed - use updateMany to handle race conditions
    const failedItem = await prisma.aiListEnrichmentQueue.updateMany({
      where: {
        id: queueItem.id,
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
      console.log(`⚠️ Queue item ${queueItem.id} no longer exists for failure update, skipping`)
      return
    }

    // Send SSE update
    await callEnrichmentQueueUpdateSubscriptions({
      listId: queueItem.listId,
      update: {
        queueItemId: queueItem.id,
        listId: queueItem.listId,
        fieldId: queueItem.fieldId,
        fileId: queueItem.fileId,
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
    const availableCapacity = MAX_CONCURRENT_ENRICHMENTS - currentEnrichmentCalls
    if (availableCapacity <= 0) {
      return
    }

    // Get pending items from the queue, limited by available capacity
    const queueItems = await prisma.aiListEnrichmentQueue.findMany({
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
    await Promise.all(queueItems.map(processQueueItem))
  } catch (error) {
    console.error('Error in enrichment queue worker:', error)
  }
}

async function resetOrphanedProcessingItems() {
  try {
    // Reset any items that were stuck in "processing" status from previous server session
    const resetResult = await prisma.aiListEnrichmentQueue.updateMany({
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
  processQueue()

  // Set up interval to process queue
  workerInterval = setInterval(() => {
    processQueue()
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

// Note: The worker is started explicitly by the server in server.ts
// This ensures proper initialization order and error handling
