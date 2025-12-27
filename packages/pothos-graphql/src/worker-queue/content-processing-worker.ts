import fs from 'fs'
import path from 'node:path'

import type { ServiceProviderType } from '@george-ai/ai-service-client'
import {
  type ExtractionMethodId,
  type FileConverterOptions,
  type FileConverterResult,
  isMethodAvailableForMimeType,
  isValidExtractionMethod,
  parseFileConverterOptions,
  transformCsvToMarkdown,
  transformDocxToMarkdown,
  transformEmlToMarkdown,
  transformExcelToMarkdown,
  transformHtmlToMarkdown,
  transformPdfToImageToMarkdown,
  transformPdfToMarkdown,
  transformTextToMarkdown,
  validateOptionsForExtractionMethod,
} from '@george-ai/file-converter'
import {
  getExtractionFileInfo,
  getFileDir,
  getUploadFilePath,
  iterateExtractionFiles,
  parseExtractionMainName,
  saveMarkdownContent,
} from '@george-ai/file-management'
import { dropFileFromVectorstore, embedMarkdownFile } from '@george-ai/langchain-chat'
import { createLogger } from '@george-ai/web-utils'
import { createTimeoutSignal, mergeObjectToJsonString } from '@george-ai/web-utils'

import { Prisma } from '../../prisma/generated/client'
import { logModelUsage } from '../domain/languageModel'
import { createListItemsForProcessedFile } from '../domain/list/item-extraction'
import { getLibraryWorkspace } from '../domain/workspace'
import { prisma } from '../prisma'

const logger = createLogger('Content Processing Worker')

let isWorkerRunning = false
let workerInterval: NodeJS.Timeout | null = null

const WORKER_INTERVAL_MS = 5000 // Process queue every 5 seconds
const MAX_CONCURRENT_PROCESSINGS = 3 // Maximum concurrent extractions

// Track concurrent extraction calls
let processingCount = 0

type ProcessingTaskRecord = Prisma.AiContentProcessingTaskGetPayload<{
  include: {
    extractionSubTasks: true
    embeddingModel: { select: { id: true; provider: true; name: true } }
    file: {
      select: {
        id: true
        name: true
        originUri: true
        mimeType: true
        libraryId: true
        createdAt: true
      }
    }
  }
}>

type ProcessingTaskUpdate = Prisma.AiContentProcessingTaskUpdateInput

type ExtractionSubTaskRecord = Prisma.AiContentExtractionSubTaskGetPayload<{
  select: {
    id: true
    createdAt: true
    startedAt: true
    contentProcessingTaskId: true
    extractionMethod: true
    markdownFileName: true
    finishedAt: true
    failedAt: true
  }
}>

type ExtractionSubTaskUpdate = Prisma.AiContentExtractionSubTaskUpdateInput

class ProcessingTaskAbortError extends Error {
  cause: 'timeout' | 'cancel'
  data: { processingTask?: ProcessingTaskRecord; subTask?: ExtractionSubTaskRecord }
  constructor(props: {
    cause: 'timeout' | 'cancel'
    data: { processingTask?: ProcessingTaskRecord; subTask?: ExtractionSubTaskRecord }
  }) {
    const { cause, data } = props
    super(
      `Processing task ${data.processingTask ? data.processingTask.id : data.subTask?.contentProcessingTaskId} ${data.subTask ? data.subTask.id : ' no subtask'} aborted due to ${cause}`,
    )
    this.cause = cause
    this.data = data
  }
}

const updateProcessingTask = async (args: {
  task: ProcessingTaskRecord
  timeoutSignal: AbortSignal
  data: ProcessingTaskUpdate
}): Promise<ProcessingTaskRecord> => {
  const update = await prisma.aiContentProcessingTask.update({
    include: {
      extractionSubTasks: true,
      embeddingModel: { select: { id: true, provider: true, name: true } },
      file: {
        select: {
          id: true,
          name: true,
          originUri: true,
          mimeType: true,
          libraryId: true,
          createdAt: true,
        },
      },
    },
    where: { id: args.task.id },
    data: { ...args.data },
  })
  if (args.timeoutSignal.aborted) {
    logger.warn(`Task ${args.task.id} aborted due to timeout`)
    throw new ProcessingTaskAbortError({
      cause: 'timeout',
      data: { processingTask: { ...update, processingTimeout: true } },
    })
  }
  if (!update.processingCancelled) {
    return update
  } else {
    logger.warn(`Task ${args.task.id} aborted due to user cancellation`)
    throw new ProcessingTaskAbortError({
      cause: 'cancel',
      data: { processingTask: { ...update, processingCancelled: true } },
    })
  }
}

const updateSubTask = async (args: {
  subTask: ExtractionSubTaskRecord
  timeoutSignal: AbortSignal
  data: ExtractionSubTaskUpdate
}): Promise<ExtractionSubTaskRecord> => {
  const update = await prisma.aiContentExtractionSubTask.update({
    include: { contentProcessingTask: { select: { processingCancelled: true } } },
    where: { id: args.subTask.id },
    data: args.data,
  })

  if (args.timeoutSignal.aborted) {
    logger.warn(`Task ${update.contentProcessingTaskId} Subtask ${update.id} aborted due to timeout`)
    throw new ProcessingTaskAbortError({
      cause: 'timeout',
      data: { subTask: { ...update } },
    })
  }

  if (update.contentProcessingTask.processingCancelled) {
    logger.warn(`Task ${update.contentProcessingTaskId} Subtask ${update.id} aborted due to user cancellation`)
    throw new ProcessingTaskAbortError({
      cause: 'cancel',
      data: { subTask: { ...update } },
    })
  }

  return update
}

async function processTask(args: { task: ProcessingTaskRecord }) {
  processingCount++

  let { task } = args

  const { timeoutSignal, clearTimeoutSignal } = createTimeoutSignal({
    timeoutMs: task.timeoutMs || 30 * 60 * 1000,
    onTimeout: async () => {
      await prisma.aiContentProcessingTask.update({
        where: { id: task.id },
        data: {
          processingFailedAt: new Date(),
          processingTimeout: true,
        },
      })
    },
  })

  try {
    logger.info(
      `Processing extraction task ${task.id} for file ${task.fileId} with methods ${task.extractionSubTasks.map((s) => s.extractionMethod).join(', ')}`,
    )

    task = await updateProcessingTask({
      task,
      timeoutSignal,
      data: {
        processingStartedAt: new Date(),
      },
    })

    const validationResult = await performValidation({
      taskId: task.id,
      timeoutSignal,
      extractionSubTasks: task.extractionSubTasks,
      extractionOptions: task.extractionOptions,
      mimeType: task.file.mimeType,
      embeddingModelProvider: (task.embeddingModel?.provider as ServiceProviderType) ?? null,
      embeddingModelName: task.embeddingModel?.name ?? null,
      fileId: task.fileId,
      fileName: task.file.name,
      libraryId: task.file.libraryId,
      metadata: task.metadata,
    })
    if (!validationResult.success) {
      const message = `Validation failed for task ${task.id}: ${validationResult.errors?.join('; ')}`
      logger.error(message)
      task = await updateProcessingTask({
        task,
        timeoutSignal,
        data: {
          processingFailedAt: new Date(),
          metadata: mergeObjectToJsonString(task.metadata, { validationErrors: validationResult.errors }),
        },
      })
      return
    }

    const validated = validationResult.validated!

    const onlyEmbeddingTasks = task.extractionSubTasks.every((sub) => sub.extractionMethod === 'embedding-only')

    if (!onlyEmbeddingTasks) {
      logger.debug(`Starting content extraction phase for task ${task.id}`)

      task = await updateProcessingTask({
        task,
        timeoutSignal,
        data: {
          extractionStartedAt: new Date(),
        },
      })

      const extractionResultPromises = task.extractionSubTasks
        .filter((subTask) => subTask.extractionMethod !== 'embedding-only' && !subTask.finishedAt && !subTask.failedAt)
        .map(async (subTask) => {
          // Process each extraction method sequentially to avoid I/O overload
          logger.debug(
            `Starting extraction method ${subTask.extractionMethod} for task ${task.id} and subtask ${subTask.id}`,
          )

          subTask = await updateSubTask({
            subTask,
            timeoutSignal,
            data: {
              startedAt: new Date(),
            },
          })

          // Perform the content extraction
          const extractionResult = await performContentExtraction({
            taskId: task.id,
            timeoutSignal,
            fileId: task.fileId,
            libraryId: task.file.libraryId,
            fileName: task.file.name,
            fileCreatedAt: task.file.createdAt,
            extractionMethod: subTask.extractionMethod as ExtractionMethodId,
            extractionOptions: validated.extractionOptions,
            uploadFilePath: validated.uploadFilePath!,
            mimeType: task.file.mimeType,
            ocrModel: validated.extractionOptions?.ocrModel,
          })

          if (!extractionResult.success) {
            subTask = await updateSubTask({
              subTask,
              timeoutSignal,
              data: {
                failedAt: new Date(),
              },
            })
          } else {
            subTask = await updateSubTask({
              subTask,
              data: {
                finishedAt: new Date(),
                markdownFileName: extractionResult.result!.markdownFileName,
              },
              timeoutSignal,
            })
          }
          logger.debug(
            `Completed extraction method ${subTask.extractionMethod} for task ${task.id} and subtask ${subTask.id}`,
          )
          return { subTask, extractionResult }
        })
      // Await all extraction methods
      const extractionResults = await Promise.allSettled(extractionResultPromises)

      logger.debug(`Saving extraction results for task ${task.id}`)

      const extractionResultsFulfilled = extractionResults
        .filter((result) => result.status === 'fulfilled')
        .map((res) => res.value)

      const failedExtractions = extractionResults.filter((r) => r.status === 'rejected')

      if (failedExtractions.length > 0) {
        logger.error(`Failed extractions for task ${task.id}:`, failedExtractions)
      }

      // Serialize error objects for failed extractions (Error objects don't JSON.stringify properly)
      const extractionResultsSerializable = extractionResults.map((result) => {
        if (result.status === 'rejected') {
          return {
            status: result.status,
            reason:
              result.reason instanceof Error
                ? {
                    message: result.reason.message,
                    stack: result.reason.stack,
                    name: result.reason.name,
                  }
                : result.reason,
          }
        }
        return result
      })

      const allSuccessful = extractionResultsFulfilled.every((result) => result.extractionResult.success)
      if (!allSuccessful) {
        task = await updateProcessingTask({
          task,
          timeoutSignal,
          data: {
            extractionFailedAt: new Date(),
            processingFailedAt: new Date(),
            metadata: mergeObjectToJsonString(task.metadata, { extractionResults: extractionResultsSerializable }),
          },
        })
        logger.error(`Extraction phase failed for task ${task.id}`)
        return
      } else {
        task = await updateProcessingTask({
          task,
          timeoutSignal,
          data: {
            extractionFinishedAt: new Date(),
            extractionTimeout:
              extractionResultsFulfilled.some((result) => {
                const errorMessage =
                  result.extractionResult.error instanceof Error ? result.extractionResult.error.message : ''
                return errorMessage.includes('timeout')
              }) || false,
            metadata: mergeObjectToJsonString(task.metadata, { extractionResults: extractionResultsSerializable }), // TODO: Not loosing metadata from previous steps
          },
        })
      }

      logger.debug(`Completed extraction task ${task.id}`)

      // Create list items for any lists that link to this library
      // This only needs markdown content, not embeddings
      try {
        const itemResult = await createListItemsForProcessedFile(task.fileId, task.file.libraryId)
        if (itemResult.created > 0) {
          logger.debug(
            `Created ${itemResult.created} list items for file ${task.fileId} across ${itemResult.sources} sources`,
          )
        }
      } catch (error) {
        logger.error(`Failed to create list items for file ${task.fileId}:`, error)
        // Don't fail the task - list item creation is secondary to file processing
      }
    }

    // Start embedding phase with explicit data (no database re-query)
    logger.debug(`Starting embedding phase for task ${task.id}`)
    task = await updateProcessingTask({
      task,
      timeoutSignal,
      data: {
        embeddingStartedAt: new Date(),
      },
    })

    const markdownFileNames = task.extractionSubTasks
      .map((sub) => sub.markdownFileName)
      .filter((name): name is string => !!name) // Non-null as filtered
    if (markdownFileNames.length < 1) {
      task = await updateProcessingTask({
        task,
        timeoutSignal,
        data: {
          embeddingFailedAt: new Date(),
          processingFailedAt: new Date(),
          metadata: mergeObjectToJsonString(task.metadata, {
            embeddingError: 'No markdown file available for embedding',
          }),
        },
      })
      logger.error(`Embedding phase failed for task ${task.id}: no markdown file`)
      return
    }

    // clear vector store upfront
    await dropFileFromVectorstore(task.file.libraryId, task.file.id)
    const embeddingPromises = markdownFileNames.map(async (markdownFileName) => {
      const embeddingResult = await processEmbeddingPhase({
        taskId: task.id,
        timeoutSignal,
        fileId: task.fileId,
        fileName: task.file.name!,
        originUri: task.file.originUri,
        mimeType: task.file.mimeType!,
        libraryId: task.file.libraryId,
        markdownFileName: markdownFileName,
        embeddingModelId: task.embeddingModel?.id,
        embeddingModelProvider: validated.embeddingModelProvider,
        embeddingModelName: validated.embeddingModelName,
      })
      return embeddingResult
    })

    const embeddingResultsSettled = await Promise.allSettled(embeddingPromises)

    const successfulEmbeddingResults = embeddingResultsSettled.filter((r) => r.status === 'fulfilled')
    const failedEmbeddingResults = embeddingResultsSettled.filter((r) => r.status === 'rejected')

    // Serialize error objects for failed embeddings (Error objects don't JSON.stringify properly)
    const failedEmbeddingResultsSerializable = failedEmbeddingResults.map((result) => ({
      status: result.status,
      reason:
        result.reason instanceof Error
          ? {
              message: result.reason.message,
              stack: result.reason.stack,
              name: result.reason.name,
            }
          : result.reason,
    }))

    const metadata = mergeObjectToJsonString(task.metadata, {
      successfulEmbeddingResults,
      failedEmbeddingResults: failedEmbeddingResultsSerializable,
    })
    const hasFailures = failedEmbeddingResults.length > 0
    const hasSuccess = successfulEmbeddingResults.length > 0

    if (!hasSuccess) {
      // total failure
      task = await updateProcessingTask({
        task,
        timeoutSignal,
        data: {
          embeddingFailedAt: new Date(),
          processingFailedAt: new Date(),
          embeddingTimeout: failedEmbeddingResults.some((result) => {
            const errorMessage = result.reason instanceof Error ? result.reason.message : ''
            return errorMessage.includes('timeout') || errorMessage.includes('timed out')
          }),
          metadata: metadata,
        },
      })
      logger.error(`Embedding phase failed for task ${task.id}`)
      return
    } else {
      task = await updateProcessingTask({
        task,
        timeoutSignal,
        data: {
          embeddingFinishedAt: new Date(),
          embeddingTimeout: successfulEmbeddingResults.some((result) => result.value.timeout) || false,
          processingFinishedAt: new Date(),
          metadata: metadata,
          chunksCount: successfulEmbeddingResults
            .map((result) => result.value.chunks)
            .reduce((sum, res) => sum + res, 0),
          chunksSize: successfulEmbeddingResults.reduce((sum, res) => sum + (res.value.size || 0), 0),
        },
      })
    }
    if (hasFailures) {
      logger.warn(
        `Embedding phase completed with warnings for task ${task.id}: ${failedEmbeddingResults.length}/${embeddingResultsSettled.length} failed`,
      )
    } else {
      logger.debug(`Embedding phase completed successfully for task ${task.id}`)
    }
    logger.info(`Completed task ${task.id}`)
  } catch (error) {
    if (error instanceof ProcessingTaskAbortError) {
      const failedTask = await prisma.aiContentProcessingTask.findUniqueOrThrow({ where: { id: task.id } })
      if (error.cause === 'cancel') {
        await prisma.aiContentProcessingTask.update({
          where: { id: task.id },
          data: {
            processingFinishedAt: failedTask.processingFinishedAt || new Date(),
            processingCancelled: true,
            extractionFailedAt: failedTask.extractionStartedAt && !failedTask.extractionFinishedAt ? new Date() : null,
            embeddingFailedAt: failedTask.embeddingStartedAt && !failedTask.embeddingFinishedAt ? new Date() : null,
            extractionSubTasks: {
              updateMany: { where: { finishedAt: null, failedAt: null }, data: { failedAt: new Date() } },
            },
          },
        })
      } else if (error.cause === 'timeout') {
        await prisma.aiContentProcessingTask.update({
          where: { id: task.id },
          data: {
            processingFailedAt: failedTask.processingFailedAt || new Date(),
            processingTimeout: true,
            extractionFailedAt: failedTask.extractionStartedAt && !failedTask.extractionFinishedAt ? new Date() : null,
            embeddingFailedAt: failedTask.embeddingStartedAt && !failedTask.embeddingFinishedAt ? new Date() : null,
            extractionSubTasks: {
              updateMany: { where: { finishedAt: null, failedAt: null }, data: { failedAt: new Date() } },
            },
          },
        })
      }

      logger.warn(
        `Task ${error.data.processingTask ? error.data.processingTask.id : error.data.subTask?.contentProcessingTaskId} aborted due to ${error.cause}`,
      )
      return
    }
    // Catch unexpected infrastructure errors (DB offline, out of memory, etc.)
    // Business logic errors are handled in validation and extraction phases
    logger.error(`Infrastructure error in task ${task.id}:`, error)

    // Only try to update DB if it's not a DB connectivity issue
    try {
      task = await updateProcessingTask({
        task,
        timeoutSignal,
        data: {
          processingFailedAt: new Date(),
          extractionFailedAt: task.extractionStartedAt && !task.extractionFinishedAt ? new Date() : null,
          embeddingFailedAt: task.embeddingStartedAt && !task.embeddingFinishedAt ? new Date() : null,
          metadata: mergeObjectToJsonString(task?.metadata, {
            infrastructureError: error instanceof Error ? error.message : 'Unknown infrastructure error',
            timestamp: new Date().toISOString(),
          }),
          extractionSubTasks: {
            updateMany: { where: { finishedAt: null, failedAt: null }, data: { failedAt: new Date() } },
          },
        },
      })
    } catch (dbError) {
      logger.error(`Could not update task ${task.id} after infrastructure error:`, dbError)
    }
  } finally {
    clearTimeoutSignal()
    processingCount--
  }
}

// Batch processing constants for large bucketed extractions
const PARTS_PER_BATCH = 1000 // Process 1000 parts per batch
const MIN_PARTS_FOR_BATCHING = 500 // Only use batching for 500+ parts

/**
 * Process a single batch of parts in parallel
 * This helper function encapsulates the embedding logic for a range of parts
 */
const processPartBatch = async (args: {
  batchNumber: number
  startPart: number
  endPart: number
  taskId: string
  timeoutSignal: AbortSignal
  fileId: string
  fileName: string
  originUri: string | null
  mimeType: string
  libraryId: string
  extractionMethod: string
  extractionMethodParameter?: string
  embeddingModelProvider: ServiceProviderType
  embeddingModelName: string
  workspaceId: string
}) => {
  logger.info(`[Batch ${args.batchNumber}] Starting parts ${args.startPart}-${args.endPart}`)

  let batchChunks = 0
  let batchSize = 0
  let batchTimeout = false
  const batchChunkErrors: Array<{ chunk: unknown; errorMessage: string }> = []
  let partCount = 0

  // Iterate through parts in this batch
  for await (const { filePath, part } of iterateExtractionFiles({
    fileId: args.fileId,
    libraryId: args.libraryId,
    extractionMethod: args.extractionMethod,
    extractionMethodParameter: args.extractionMethodParameter,
    startPart: args.startPart,
    endPart: args.endPart,
  })) {
    if (args.timeoutSignal.aborted) {
      logger.warn(`[Batch ${args.batchNumber}] Aborted after ${partCount} parts`)
      batchTimeout = true
      break
    }

    partCount++

    // Embed this part
    const embeddedFile = await embedMarkdownFile({
      timeoutSignal: args.timeoutSignal,
      workspaceId: args.workspaceId,
      libraryId: args.libraryId,
      embeddingModelProvider: args.embeddingModelProvider,
      embeddingModelName: args.embeddingModelName,
      fileId: args.fileId,
      fileName: args.fileName,
      originUri: args.originUri || '',
      mimeType: args.mimeType,
      markdownFilePath: filePath,
      part,
    })

    batchChunks += embeddedFile.chunks
    batchSize += embeddedFile.size
    batchTimeout = batchTimeout || embeddedFile.timeout || false
    batchChunkErrors.push(...embeddedFile.chunkErrors)
  }

  logger.info(`[Batch ${args.batchNumber}] Completed ${partCount} parts: ${batchChunks} chunks, ${batchSize} bytes`)

  return {
    batchNumber: args.batchNumber,
    partCount,
    chunks: batchChunks,
    size: batchSize,
    timeout: batchTimeout,
    chunkErrors: batchChunkErrors,
  }
}

const processEmbeddingPhase = async (args: {
  taskId: string
  timeoutSignal: AbortSignal
  fileId: string
  fileName: string
  originUri: string | null
  mimeType: string
  libraryId: string
  markdownFileName: string
  embeddingModelId: string | undefined
  embeddingModelProvider: ServiceProviderType
  embeddingModelName: string
}) => {
  logger.debug(`Starting embedding phase for task ${args.taskId}`)

  // Get workspaceId from library
  const workspaceId = await getLibraryWorkspace(args.libraryId)
  if (!workspaceId) {
    throw new Error(`Library ${args.libraryId} has no workspace`)
  }

  // Parse extraction method from filename
  const mainName = args.markdownFileName.replace(/\.md$/, '')
  const { extractionMethod, extractionMethodParameter } = parseExtractionMainName(mainName)

  // Check if this is a large bucketed extraction that should use batch processing
  const extractionInfo = await getExtractionFileInfo({
    fileId: args.fileId,
    libraryId: args.libraryId,
    extractionMethod,
    extractionMethodParameter: extractionMethodParameter || undefined,
  })

  const startTime = Date.now()
  let totalChunks = 0
  let totalSize = 0
  let totalTimeout = false
  const allChunkErrors: Array<{ chunk: unknown; errorMessage: string }> = []
  let fileCount = 0

  // Use batch processing for large bucketed extractions
  if (extractionInfo.isBucketed && extractionInfo.totalParts >= MIN_PARTS_FOR_BATCHING) {
    logger.info(
      `Large bucketed extraction detected: ${extractionInfo.totalParts} parts. Using batch processing with ${PARTS_PER_BATCH} parts per batch.`,
    )

    // Split into batches
    const batches: Array<{ batchNumber: number; startPart: number; endPart: number }> = []
    for (let startPart = 1; startPart <= extractionInfo.totalParts; startPart += PARTS_PER_BATCH) {
      const endPart = Math.min(startPart + PARTS_PER_BATCH - 1, extractionInfo.totalParts)
      batches.push({
        batchNumber: Math.floor((startPart - 1) / PARTS_PER_BATCH) + 1,
        startPart,
        endPart,
      })
    }

    logger.info(`Split into ${batches.length} batches for parallel processing`)

    // Process batches in parallel
    const batchResults = await Promise.allSettled(
      batches.map((batch) =>
        processPartBatch({
          ...batch,
          taskId: args.taskId,
          timeoutSignal: args.timeoutSignal,
          fileId: args.fileId,
          fileName: args.fileName,
          originUri: args.originUri,
          mimeType: args.mimeType,
          libraryId: args.libraryId,
          extractionMethod,
          extractionMethodParameter: extractionMethodParameter || undefined,
          embeddingModelProvider: args.embeddingModelProvider,
          embeddingModelName: args.embeddingModelName,
          workspaceId,
        }),
      ),
    )

    // Aggregate results from all batches
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        fileCount += result.value.partCount
        totalChunks += result.value.chunks
        totalSize += result.value.size
        totalTimeout = totalTimeout || result.value.timeout
        allChunkErrors.push(...result.value.chunkErrors)
      } else {
        logger.error(`Batch failed with error: ${result.reason}`)
        // Continue processing other batches even if one fails
      }
    }

    logger.info(`Batch processing complete: ${fileCount} parts, ${totalChunks} chunks, ${totalSize} bytes`)
  } else {
    // Sequential processing for small extractions or non-bucketed files
    logger.info(`Using sequential processing for ${extractionInfo.totalParts} parts`)

    for await (const { filePath, part } of iterateExtractionFiles({
      fileId: args.fileId,
      libraryId: args.libraryId,
      extractionMethod,
      extractionMethodParameter: extractionMethodParameter || undefined,
    })) {
      if (args.timeoutSignal.aborted) {
        logger.warn(`Embedding aborted after processing ${fileCount} files`)
        totalTimeout = true
        break
      }

      fileCount++

      // Embed this file (could be main file or a part)
      const embeddedFile = await embedMarkdownFile({
        timeoutSignal: args.timeoutSignal,
        workspaceId,
        libraryId: args.libraryId,
        embeddingModelProvider: args.embeddingModelProvider,
        embeddingModelName: args.embeddingModelName,
        fileId: args.fileId,
        fileName: args.fileName,
        originUri: args.originUri || '',
        mimeType: args.mimeType,
        markdownFilePath: filePath,
        part,
      })

      totalChunks += embeddedFile.chunks
      totalSize += embeddedFile.size
      totalTimeout = totalTimeout || embeddedFile.timeout || false
      allChunkErrors.push(...embeddedFile.chunkErrors)

      // Log progress every 100 files
      if (part && part % 100 === 0) {
        logger.info(`Embedded ${part} parts: ${totalChunks} chunks, ${totalSize} bytes`)
      }
    }
  }

  // Log usage for embeddings (async, non-blocking)
  const durationMs = Date.now() - startTime
  await logModelUsage({
    modelId: args.embeddingModelId,
    libraryId: args.libraryId,
    usageType: 'embedding',
    durationMs,
    tokensInput: totalSize,
    tokensOutput: totalChunks,
  })

  logger.info(`Completed embedding ${fileCount} files: ${totalChunks} chunks, ${totalSize} bytes`)

  return {
    success: true,
    timeout: totalTimeout,
    chunks: totalChunks,
    chunkErrors: allChunkErrors,
    size: totalSize,
  }
}

const performValidation = async (args: {
  taskId: string
  timeoutSignal: AbortSignal
  extractionSubTasks: Array<{ extractionMethod: string; markdownFileName?: string | null; finishedAt?: Date | null }>
  extractionOptions?: string | null
  mimeType: string | null
  embeddingModelProvider: ServiceProviderType | null
  embeddingModelName: string | null
  fileId: string
  fileName: string | null
  libraryId: string
  metadata: string | null
  markdownFileName?: string | null
}) => {
  logger.debug(`Starting validation phase for task ${args.taskId}`)

  const errors: string[] = []

  const fileConverterOptions = parseFileConverterOptions(args.extractionOptions)
  const uploadFilePath = getUploadFilePath({ fileId: args.fileId, libraryId: args.libraryId })

  args.extractionSubTasks.forEach((subTask) => {
    if (!isValidExtractionMethod(subTask.extractionMethod)) {
      errors.push(`Invalid extraction method in sub-task: ${subTask.extractionMethod}`)
      return
    }

    // Validate options for this specific extraction method
    const validation = validateOptionsForExtractionMethod(args.extractionOptions, subTask.extractionMethod)
    if (!validation.success) {
      errors.push(`Invalid options for ${subTask.extractionMethod}: ${validation.error}`)
    }
    if (subTask.extractionMethod === 'embedding-only') {
      if (!subTask.markdownFileName) {
        errors.push('No markdown file specified for embedding-only sub-task')
      } else {
        // Check if markdown file exists
        const markdownPath = path.join(
          getFileDir({ fileId: args.fileId, libraryId: args.libraryId }),
          subTask.markdownFileName,
        )
        if (!fs.existsSync(markdownPath)) {
          errors.push(`Markdown file for embedding-only sub-task not found: ${subTask.markdownFileName}`)
        }
      }
    } else {
      if (subTask.markdownFileName) {
        errors.push(
          `Markdown file should not be specified for non-embedding-only sub-task: ${subTask.extractionMethod}`,
        )
      }
      if (subTask.finishedAt) {
        errors.push(`Extraction sub-task should not be finished for method: ${subTask.extractionMethod}`)
      }

      if (!fs.existsSync(uploadFilePath)) {
        errors.push(`Upload file not found for extraction method ${subTask.extractionMethod}: ${uploadFilePath}`)
      }
      if (
        !isValidExtractionMethod(subTask.extractionMethod) ||
        !isMethodAvailableForMimeType(subTask.extractionMethod, args.mimeType)
      ) {
        errors.push(`Unsupported extraction method: ${subTask.extractionMethod} and mime type: ${args.mimeType}`)
      }
    }
  })

  if (args.extractionSubTasks.length === 0) {
    errors.push('No extraction sub-tasks defined')
    return { success: false, errors }
  }

  if (!args.embeddingModelProvider) {
    errors.push('Library embedding model provider not configured')
  }

  // Validate embedding model is configured
  if (!args.embeddingModelName) {
    errors.push(`Library embedding model not configured`)
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  logger.debug(`Validation passed for task ${args.taskId}`)
  return {
    success: true,
    validated: {
      extractionSubTasks: args.extractionSubTasks,
      extractionOptions: fileConverterOptions,
      embeddingModelProvider: args.embeddingModelProvider!,
      embeddingModelName: args.embeddingModelName!,
      uploadFilePath,
    },
  }
}

const performContentExtraction = async (args: {
  taskId: string
  timeoutSignal: AbortSignal
  fileId: string
  libraryId: string
  fileName: string
  fileCreatedAt: Date
  extractionMethod: ExtractionMethodId
  extractionOptions: FileConverterOptions
  uploadFilePath: string
  mimeType: string
  ocrModel?: {
    id: string
    name: string
    provider: string
  }
}) => {
  try {
    // Process based on extraction method
    let result: FileConverterResult

    switch (args.extractionMethod) {
      case 'docx-extraction':
        result = await transformDocxToMarkdown(args.uploadFilePath)
        break

      case 'excel-extraction':
        result = await transformExcelToMarkdown(args.uploadFilePath, args.timeoutSignal)
        break

      case 'csv-extraction':
        result = await transformCsvToMarkdown(
          args.uploadFilePath,
          args.timeoutSignal,
          args.libraryId,
          args.fileId,
          args.fileName,
        )
        break

      case 'html-extraction':
        result = await transformHtmlToMarkdown(args.uploadFilePath)
        break

      case 'eml-extraction':
        result = await transformEmlToMarkdown(args.uploadFilePath)
        break

      case 'text-extraction': {
        if (args.mimeType === 'application/pdf') {
          result = await transformPdfToMarkdown(args.uploadFilePath, args.timeoutSignal)
        } else {
          result = await transformTextToMarkdown(args.uploadFilePath, args.mimeType)
        }
        break
      }

      case 'pdf-image-llm': {
        if (!args.ocrModel) {
          throw new Error('OCR model provider and name must be specified for pdf-image-llm extraction')
        }
        // Get workspaceId from library
        const workspaceId = await getLibraryWorkspace(args.libraryId)
        if (!workspaceId) {
          throw new Error(`Library ${args.libraryId} has no workspace`)
        }

        result = await transformPdfToImageToMarkdown({
          filePath: args.uploadFilePath,
          timeoutSignal: args.timeoutSignal,
          imageScale: args.extractionOptions.ocrImageScale,
          ocrPrompt: args.extractionOptions.ocrPrompt,
          workspaceId,
          ocrModelProvider: args.ocrModel.provider as ServiceProviderType,
          ocrModelName: args.ocrModel.name,
          ocrTimeoutPerPage: args.extractionOptions.ocrTimeout * 1000, // Convert seconds to milliseconds
          ocrMaxConsecutiveRepeats: args.extractionOptions.ocrMaxConsecutiveRepeats,
        })
        break
      }

      default:
        throw new Error(`Unsupported extraction method: ${args.extractionMethod}`)
    }

    // Save markdown file
    const markdownFileName = await saveMarkdownContent({
      fileId: args.fileId,
      libraryId: args.libraryId,
      extractionMethod: args.extractionMethod,
      markdown: result.markdownContent,
      extractionMethodParameter:
        args.extractionMethod === 'pdf-image-llm' ? `${args.ocrModel?.provider}:${args.ocrModel?.name}` : undefined,
    })

    return {
      success: result.success,
      result: {
        extractionTimeMs: result.processingTimeMs,
        notes: result.notes,
        timeout: result.timeout,
        partialResult: result.partialResult,
        metadata: result.metadata,
        markdownFileName,
        markdownContent: result.markdownContent,
      },
    }
  } catch (error) {
    logger.error(`Error in extraction phase for task ${args.taskId}:`, error)
    return { success: false, error }
  }
}

async function processQueue() {
  if (!isWorkerRunning) return

  try {
    // Only get tasks if we have capacity
    const availableCapacity = MAX_CONCURRENT_PROCESSINGS - processingCount
    if (availableCapacity <= 0) {
      return
    }

    // Get pending tasks (tasks that are started but not finished, failed, timed out, or validation failed)
    const pendingTasks = await prisma.aiContentProcessingTask.findMany({
      include: {
        extractionSubTasks: true,
        embeddingModel: { select: { id: true, provider: true, name: true } },
        file: {
          select: {
            id: true,
            name: true,
            originUri: true,
            mimeType: true,
            libraryId: true,
            createdAt: true,
          },
        },
      },
      where: {
        OR: [
          { processingStartedAt: null }, // Not started yet
          {
            processingStartedAt: { not: null },
            processingFinishedAt: null,
            processingFailedAt: null,
            OR: [{ processingTimeout: true }, { processingCancelled: true }],
          }, // Started but not finished/failed/timed out/cancelled
        ],
      },
      orderBy: { createdAt: 'asc' }, // Process oldest tasks first
      take: availableCapacity,
    })

    if (pendingTasks.length === 0) {
      return
    }

    logger.info(`Processing ${pendingTasks.length} tasks (capacity: ${availableCapacity})`)

    // Process tasks in parallel
    await Promise.all(pendingTasks.map((task) => processTask({ task })))
  } catch (error) {
    logger.error('Error in content processing worker processQueue:', error)
  }
}

export async function startContentProcessingWorker() {
  if (isWorkerRunning) {
    logger.warn('Content processing worker is already running')
    return
  }

  isWorkerRunning = true
  logger.info('Starting content processing worker...')

  // Process queue immediately
  await processQueue()

  // Set up interval to process queue
  workerInterval = setInterval(async () => {
    await processQueue()
  }, WORKER_INTERVAL_MS)
}

export function stopContentProcessingWorker() {
  if (!isWorkerRunning) {
    logger.warn('Content processing worker is not running')
    return
  }

  isWorkerRunning = false

  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
  }

  logger.info('Stopped content processing worker')
}

export function isContentProcessingWorkerRunning(): boolean {
  return isWorkerRunning
}
