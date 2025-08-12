import { getEnrichedValue } from '@george-ai/langchain-chat'
import type { Prisma } from '@george-ai/prismaClient'

import { callEnrichmentQueueUpdateSubscriptions } from './enrichment-queue-subscription'
import { prisma } from './prisma'

let isWorkerRunning = false
let workerInterval: NodeJS.Timeout | null = null

const WORKER_INTERVAL_MS = 2000 // Process queue every 2 seconds
const BATCH_SIZE = 5 // Process up to 5 items at a time

// Helper function to get field value for a file
async function getFieldValue(
  file: Prisma.AiLibraryFileGetPayload<object>,
  field: Prisma.AiListFieldGetPayload<object>,
  cache?: Prisma.AiListItemCacheGetPayload<object> | null,
): Promise<string | null> {
  // Handle file property fields
  if (field.sourceType === 'file_property' && field.fileProperty) {
    switch (field.fileProperty) {
      case 'name':
        return file.name
      case 'originUri':
        return file.originUri
      case 'crawlerUrl': {
        if (!file.crawledByCrawlerId) return null
        const crawler = await prisma.aiLibraryCrawler.findFirst({
          where: { id: file.crawledByCrawlerId },
        })
        return crawler?.uri || null
      }
      case 'processedAt':
        return file.processedAt?.toISOString() || null
      case 'originModificationDate':
        return file.originModificationDate?.toISOString() || null
      case 'size':
        return file.size?.toString() || null
      case 'mimeType':
        return file.mimeType
      default:
        return null
    }
  }

  // Handle computed fields - use cached value if available
  if (field.sourceType === 'llm_computed' && cache) {
    switch (field.type) {
      case 'string':
        return cache.valueString
      case 'number':
        return cache.valueNumber?.toString() || null
      case 'boolean':
        return cache.valueBoolean !== null ? (cache.valueBoolean ? 'Yes' : 'No') : null
      case 'date':
      case 'datetime':
        return cache.valueDate?.toISOString() || null
      default:
        return cache.valueString
    }
  }

  return null
}

async function processQueueItem(queueItem: {
  id: string
  listId: string
  fieldId: string
  fileId: string
  status: string
}) {
  try {
    // Mark as processing
    await prisma.aiListEnrichmentQueue.update({
      where: { id: queueItem.id },
      data: {
        status: 'processing',
        startedAt: new Date(),
      },
    })

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

        const value = await getFieldValue(file, item.contextField, cachedValue)
        return {
          name: item.contextField.name,
          value: value || '',
        }
      }),
    )

    const computedValue = await getEnrichedValue({
      file: file,
      languageModel: field.languageModel,
      instruction: field.prompt,
      context: contextWithValues,
      options: {
        useMarkdown: field.useMarkdown || false,
      },
    }) //`[${field.type}] Computed for ${file.name}`

    // Simulate processing time
    //await new Promise((resolve) => setTimeout(resolve, 1000))

    // Store the computed value in cache
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
        valueNumber: field.type === 'number' ? Math.random() * 100 : null,
        valueBoolean: field.type === 'boolean' ? Math.random() > 0.5 : null,
        valueDate: field.type === 'date' || field.type === 'datetime' ? new Date() : null,
      },
      update: {
        valueString: field.type === 'string' ? computedValue : null,
        valueNumber: field.type === 'number' ? Math.random() * 100 : null,
        valueBoolean: field.type === 'boolean' ? Math.random() > 0.5 : null,
        valueDate: field.type === 'date' || field.type === 'datetime' ? new Date() : null,
      },
    })

    // Mark as completed
    await prisma.aiListEnrichmentQueue.update({
      where: { id: queueItem.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    })

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
        },
      },
    })

    console.log(`✅ Processed enrichment queue item ${queueItem.id}`)
  } catch (error) {
    console.error(`❌ Error processing queue item ${queueItem.id}:`, error)

    // Mark as failed
    await prisma.aiListEnrichmentQueue.update({
      where: { id: queueItem.id },
      data: {
        status: 'failed',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

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
    // Get pending items from the queue
    const queueItems = await prisma.aiListEnrichmentQueue.findMany({
      where: {
        status: 'pending',
      },
      orderBy: [{ priority: 'desc' }, { requestedAt: 'asc' }],
      take: BATCH_SIZE,
    })

    if (queueItems.length === 0) {
      return
    }

    console.log(`Processing ${queueItems.length} enrichment queue items...`)

    // Process items in parallel
    await Promise.all(queueItems.map(processQueueItem))
  } catch (error) {
    console.error('Error in enrichment queue worker:', error)
  }
}

export function startEnrichmentQueueWorker() {
  if (isWorkerRunning) {
    console.log('Enrichment queue worker is already running')
    return
  }

  isWorkerRunning = true
  console.log('🚀 Starting enrichment queue worker...')

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

// Start the worker automatically when the module is loaded
if (process.env.NODE_ENV !== 'test') {
  console.log('🔧 Enrichment queue worker module loaded')
  startEnrichmentQueueWorker()
}
