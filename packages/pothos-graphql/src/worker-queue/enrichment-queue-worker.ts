import { Message, type ServiceProviderType, chat } from '@george-ai/ai-service-client'
import { getSimilarChunks } from '@george-ai/langchain-chat'

import { Prisma } from '../../prisma/generated/client'
import { EnrichmentMetadata, substituteTemplate, validateEnrichmentTaskForProcessing } from '../domain/enrichment'
import { logModelUsage } from '../domain/languageModel'
import { getLibraryWorkspace } from '../domain/workspace'
import { prisma } from '../prisma'

let isWorkerRunning = false
let workerInterval: NodeJS.Timeout | null = null

const WORKER_INTERVAL_MS = 2000 // Process queue every 2 seconds
const BATCH_SIZE = 5 // Process up to 5 items at a time
const MAX_CONCURRENT_ENRICHMENTS = 3 // Maximum concurrent getEnrichedValue calls

async function processQueueItem({
  enrichmentTask,
  metadata,
}: {
  enrichmentTask: Prisma.AiEnrichmentTaskGetPayload<object>
  metadata: EnrichmentMetadata
}) {
  try {
    if (!metadata.input) {
      throw new Error(`no input data for processing for task ${enrichmentTask.id}`)
    }

    // Get workspaceId from library
    const workspaceId = await getLibraryWorkspace(metadata.input.libraryId)
    if (!workspaceId) {
      throw new Error(`Library ${metadata.input.libraryId} has no workspace`)
    }

    // Mark as processing - use updateMany to handle race conditions
    const updated = await prisma.aiEnrichmentTask.updateMany({
      where: {
        id: enrichmentTask.id,
        status: 'pending', // Only update if still pending
      },
      data: {
        status: 'processing',
        startedAt: new Date(),
      },
    })

    // If no rows were updated, the item was likely deleted or already processing
    if (updated.count === 0) {
      console.log(`⚠️ Task ${enrichmentTask.id} no longer pending, skipping`)
      return
    }

    // Try to get enriched value, but handle errors gracefully
    let computedValue: string | null = null
    let enrichmentError: string | null = null
    const messages: Array<Message> = []

    const outputMetaData: EnrichmentMetadata['output'] = {
      messages: [],
      similarChunks: [],
      issues: [],
    }

    messages.push({
      role: 'user',
      content: metadata.input.aiGenerationPrompt,
    })

    messages.push({
      role: 'user',
      content: `The data type you must return is: ${metadata.input.dataType}`,
    })

    messages.push({
      role: 'user',
      content: `Here comes the data you need to process:`,
    })

    try {
      // Add field reference context sources
      messages.push(
        ...metadata.input.contextFields.map((ctx) => ({
          role: 'user' as const,
          content: `Here is the context for ${ctx.fieldName}: \n${ctx.value}`,
        })),
      )

      // Process vector search context sources
      if (metadata.input.contextVectorSearches && metadata.input.contextVectorSearches.length > 0) {
        for (const vectorSearch of metadata.input.contextVectorSearches) {
          try {
            // Substitute {fieldName} placeholders in query template
            const query = substituteTemplate(vectorSearch.queryTemplate, metadata.input.contextFields)

            if (!query) {
              const issue = `vectorSearchSkipped: template substitution failed for "${vectorSearch.queryTemplate}"`
              console.warn(`⚠️ ${issue}`)
              outputMetaData.issues.push(issue)
              continue
            }

            // Check if library has embedding model configured
            if (!metadata.input.libraryEmbeddingModel || !metadata.input.libraryEmbeddingModelProvider) {
              const issue = `vectorSearchSkipped: library has no embedding model configured`
              console.warn(`⚠️ ${issue}`)
              outputMetaData.issues.push(issue)
              continue
            }

            // Execute vector search
            const chunks = await getSimilarChunks({
              workspaceId,
              libraryId: metadata.input.libraryId,
              fileId: metadata.input.fileId,
              term: query,
              embeddingsModelProvider: metadata.input.libraryEmbeddingModelProvider as ServiceProviderType,
              embeddingsModelName: metadata.input.libraryEmbeddingModel,
              hits: 5, // Get top 5 similar chunks
            })

            if (chunks.length > 0) {
              // Truncate content if maxContentTokens is specified
              // Rough estimate: 1 token ≈ 4 characters
              const maxChars = vectorSearch.maxContentTokens ? vectorSearch.maxContentTokens * 4 : undefined
              const content = chunks.map((chunk) => chunk.text).join('\n\n')
              const truncatedContent = maxChars && content.length > maxChars ? content.slice(0, maxChars) + '...' : content

              messages.push({
                role: 'user' as const,
                content: `Here is relevant context from vector search (query: "${query}"):\n${truncatedContent}`,
              })

              // Store chunks in output metadata
              outputMetaData.similarChunks?.push(
                ...chunks.map((chunk) => ({
                  id: chunk.id,
                  fileName: chunk.fileName,
                  fileId: chunk.fileId,
                  text: chunk.text,
                  distance: chunk.distance,
                })),
              )
            } else {
              const issue = `vectorSearchNoResults: no similar chunks found for query "${query}"`
              console.warn(`⚠️ ${issue}`)
              outputMetaData.issues.push(issue)
            }
          } catch (error) {
            const issue = `vectorSearchFailed: ${error instanceof Error ? error.message : 'Unknown error'}`
            console.warn(`⚠️ ${issue}`)
            outputMetaData.issues.push(issue)
          }
        }
      }

      // Process web fetch context sources
      if (metadata.input.contextWebFetches && metadata.input.contextWebFetches.length > 0) {
        for (const webFetch of metadata.input.contextWebFetches) {
          try {
            // Substitute {fieldName} placeholders in URL template
            const url = substituteTemplate(webFetch.urlTemplate, metadata.input.contextFields)

            if (!url) {
              const issue = `webFetchSkipped: template substitution failed for "${webFetch.urlTemplate}"`
              console.warn(`⚠️ ${issue}`)
              outputMetaData.issues.push(issue)
              continue
            }

            // Fetch content from URL
            const response = await fetch(url)
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            let content = await response.text()

            // Truncate content if maxContentTokens is specified
            // Rough estimate: 1 token ≈ 4 characters
            const maxChars = webFetch.maxContentTokens ? webFetch.maxContentTokens * 4 : undefined
            if (maxChars && content.length > maxChars) {
              content = content.slice(0, maxChars) + '...'
            }

            messages.push({
              role: 'user' as const,
              content: `Here is context from web fetch (URL: "${url}"):\n${content}`,
            })
          } catch (error) {
            const issue = `webFetchFailed: ${error instanceof Error ? error.message : 'Unknown error'}`
            console.warn(`⚠️ ${issue}`)
            outputMetaData.issues.push(issue)
          }
        }
      }

      outputMetaData.messages = messages

      // Track start time for usage logging
      const startTime = Date.now()

      const chatResponse = await chat(
        workspaceId,
        (metadata.input.aiModelProvider || 'ollama') as ServiceProviderType,
        {
          messages: [{ role: 'user', content: messages.map((message) => message.content).join('\n\n') }],
          modelName: metadata.input.aiModelName,
        },
      )
      computedValue = chatResponse.content.trim()

      // Log usage for enrichment (async, non-blocking)
      const durationMs = Date.now() - startTime
      await logModelUsage({
        modelId: metadata.input.aiModelId,
        listId: enrichmentTask.listId,
        libraryId: metadata.input.libraryId,
        usageType: 'enrichment',
        tokensInput: chatResponse.metadata?.promptTokens || chatResponse.metadata?.tokensProcessed,
        tokensOutput: chatResponse.metadata?.completionTokens,
        durationMs,
      })

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

    let failedEnrichmentValue: string | null = null
    if (!computedValue || computedValue === '' || computedValue.length === 0) {
      failedEnrichmentValue = 'empty'
    } else if (metadata.input.failureTerms) {
      const failureTerms = metadata.input.failureTerms.split(',').map((term) => term.trim().toLowerCase())
      if (failureTerms.includes(computedValue.toLowerCase())) {
        failedEnrichmentValue = computedValue
      }
    }

    const enrichedValues = failedEnrichmentValue
      ? {
          failedEnrichmentValue,
          // Clear all value fields when storing failed enrichment
          valueString: null,
          valueNumber: null,
          valueBoolean: null,
          valueDate: null,
        }
      : {
          // Clear failedEnrichmentValue when storing successful enrichment
          failedEnrichmentValue: null,
          valueString: computedValue,
          valueNumber:
            metadata.input.dataType === 'number' ? (computedValue ? parseFloat(computedValue) || null : null) : null,
          valueBoolean:
            metadata.input.dataType === 'boolean'
              ? computedValue
                ? computedValue.toLowerCase() === 'true'
                : null
              : null,
          valueDate:
            metadata.input.dataType === 'date' || metadata.input.dataType === 'datetime'
              ? computedValue
                ? new Date(computedValue)
                : null
              : null,
        }

    // Store the computed value or error in cache
    await prisma.aiListItemCache.upsert({
      where: {
        fileId_fieldId: {
          fileId: enrichmentTask.fileId,
          fieldId: enrichmentTask.fieldId,
        },
      },
      create: {
        fileId: enrichmentTask.fileId,
        fieldId: enrichmentTask.fieldId,
        enrichmentErrorMessage: enrichmentError,
        ...enrichedValues,
      },
      update: {
        ...enrichedValues,
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
        status: failedEnrichmentValue ? 'failed' : 'completed',
        completedAt: new Date(),
        metadata: JSON.stringify({ ...metadata, output: outputMetaData }),
      },
    })

    // If no rows were updated, the item was likely deleted
    if (completedItem.count === 0) {
      console.log(`⚠️ Queue item ${enrichmentTask.id} no longer exists for completion, skipping`)
      return
    }

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
        status: 'error',
        completedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    // If no rows were updated, the item was likely deleted
    if (failedItem.count === 0) {
      console.log(`⚠️ Queue item ${enrichmentTask.id} no longer exists for failure update, skipping`)
      return
    }
  }
}

async function processQueue() {
  if (!isWorkerRunning) return

  try {
    // Count currently processing items to calculate available capacity
    const processingCount = await prisma.aiEnrichmentTask.count({
      where: { status: 'processing' },
    })
    const availableCapacity = MAX_CONCURRENT_ENRICHMENTS - processingCount

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
              error: validationResult.error
                ? `Validation error: ${validationResult.error}`
                : `no input data for processing for task ${enrichmentTask.id}`,
            },
          })
        } else if (!validationResult.data.input) {
          return prisma.aiEnrichmentTask.update({
            where: { id: enrichmentTask.id },
            data: {
              status: 'failed',
              completedAt: new Date(),
              error: `no input data for processing for task ${enrichmentTask.id}`,
            },
          })
        } else {
          return processQueueItem({ enrichmentTask, metadata: validationResult.data })
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
