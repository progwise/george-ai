import fs from 'fs'
import path from 'node:path'

import {
  type ConverterResult,
  type ExtractionMethodId,
  type FileConverterOptions,
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
import { getFileDir, getUploadFilePath, saveMarkdownContent } from '@george-ai/file-management'
import { dropFileFromVectorstore, embedMarkdownFile } from '@george-ai/langchain-chat'
import { createTimeoutSignal, mergeObjectToJsonString } from '@george-ai/web-utils'

import { Prisma } from '../../prisma/generated/client'
import { logModelUsage } from '../domain/languageModel'
import { prisma } from '../prisma'

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
        },
      },
    },
    where: { id: args.task.id },
    data: { ...args.data },
  })
  if (args.timeoutSignal.aborted) {
    console.warn(`❌ Task ${args.task.id} aborted due to timeout`)
    throw new ProcessingTaskAbortError({
      cause: 'timeout',
      data: { processingTask: { ...update, processingTimeout: true } },
    })
  }
  if (!update.processingCancelled) {
    return update
  } else {
    console.warn(`❌ Task ${args.task.id} aborted due to user cancellation`)
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
    console.warn(`❌ Task ${update.contentProcessingTaskId} Subtask ${update.id} aborted due to timeout`)
    throw new ProcessingTaskAbortError({
      cause: 'timeout',
      data: { subTask: { ...update } },
    })
  }

  if (update.contentProcessingTask.processingCancelled) {
    console.warn(`❌ Task ${update.contentProcessingTaskId} Subtask ${update.id} aborted due to user cancellation`)
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
    console.log(
      `🔄 Processing extraction task ${task.id} for file ${task.fileId} with methods ${task.extractionSubTasks.map((s) => s.extractionMethod).join(', ')}`,
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
      embeddingModelProvider: task.embeddingModel?.provider ?? null,
      embeddingModelName: task.embeddingModel?.name ?? null,
      fileId: task.fileId,
      fileName: task.file.name,
      libraryId: task.file.libraryId,
      metadata: task.metadata,
    })
    if (!validationResult.success) {
      const message = `Validation failed for task ${task.id}: ${validationResult.errors?.join('; ')}`
      console.error(message)
      task = await updateProcessingTask({
        task,
        timeoutSignal,
        data: {
          processingFailedAt: new Date(),
          metadata: mergeObjectToJsonString(task.metadata, { validationErrors: validationResult.errors }),
        },
      })
      console.error(`❌ Validation failed for task ${task.id}`)
      return
    }

    const validated = validationResult.validated!

    const onlyEmbeddingTasks = task.extractionSubTasks.every((sub) => sub.extractionMethod === 'embedding-only')

    if (!onlyEmbeddingTasks) {
      console.log(`🔄 Starting content extraction phase for task ${task.id}`)

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
          console.log(
            `🔄 Starting extraction method ${subTask.extractionMethod} for task ${task.id} and subtask ${subTask.id}`,
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
          console.log(
            `✅ Completed extraction method ${subTask.extractionMethod} for task ${task.id} and subtask ${subTask.id}`,
          )
          return { subTask, extractionResult }
        })
      // Await all extraction methods
      const extractionResults = await Promise.allSettled(extractionResultPromises)

      console.log(`🔄 Saving extraction results for task ${task.id}`)

      const extractionResultsFulfilled = extractionResults
        .filter((result) => result.status === 'fulfilled')
        .map((res) => res.value)

      const failedExtractions = extractionResults.filter((r) => r.status === 'rejected')

      console.error('failedExtractions', failedExtractions)

      const allSuccessful = extractionResultsFulfilled.every((result) => result.extractionResult.success)
      if (!allSuccessful) {
        task = await updateProcessingTask({
          task,
          timeoutSignal,
          data: {
            extractionFailedAt: new Date(),
            processingFailedAt: new Date(),
            metadata: mergeObjectToJsonString(task.metadata, { extractionResults }),
          },
        })
        console.error(`❌ Extraction phase failed for task ${task.id}`)
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
            metadata: mergeObjectToJsonString(task.metadata, { extractionResults }), // TODO: Not loosing metadata from previous steps
          },
        })
      }

      console.log(`✅ Completed extraction task ${task.id}`)
    }

    // Start embedding phase with explicit data (no database re-query)
    console.log(`🔄 Starting embedding phase for task ${task.id}`)
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
      console.error(`❌ Embedding phase failed for task ${task.id}: no markdown file`)
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

    const metadata = mergeObjectToJsonString(task.metadata, { successfulEmbeddingResults, failedEmbeddingResults })
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
      console.error(`❌ Embedding phase failed for task ${task.id}`)
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
      console.warn(
        `⚠️ Embedding phase completed with warnings for task ${task.id}: ${failedEmbeddingResults.length}/${embeddingResultsSettled.length} failed`,
      )
    } else {
      console.log(`✅ Embedding phase completed successfully for task ${task.id}`)
    }
    console.log(`✅ Completed embedding phase for task ${task.id}`)
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

      console.log(
        `❌ Task ${error.data.processingTask ? error.data.processingTask.id : error.data.subTask?.contentProcessingTaskId} aborted due to ${error.cause}`,
      )
      return
    }
    // Catch unexpected infrastructure errors (DB offline, out of memory, etc.)
    // Business logic errors are handled in validation and extraction phases
    console.error(`❌ Infrastructure error in task ${task.id}:`, error)

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
      console.error(`❌ Could not update task ${task.id} after infrastructure error:`, dbError)
    }
  } finally {
    clearTimeoutSignal()
    processingCount--
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
  embeddingModelProvider: string
  embeddingModelName: string
}) => {
  console.log(`🔗 Starting embedding phase for task ${args.taskId}`)

  // Get markdown file path
  const markdownPath = path.join(getFileDir({ fileId: args.fileId, libraryId: args.libraryId }), args.markdownFileName)

  // Track start time for usage logging
  const startTime = Date.now()

  // Use embedFile function (embeddingModelName validated in validation phase)
  const embeddedFile = await embedMarkdownFile({
    timeoutSignal: args.timeoutSignal,
    libraryId: args.libraryId,
    embeddingModelProvider: args.embeddingModelProvider,
    embeddingModelName: args.embeddingModelName,
    fileId: args.fileId,
    fileName: args.fileName,
    originUri: args.originUri || '',
    mimeType: args.mimeType,
    markdownFilePath: markdownPath,
  })

  // Log usage for embeddings (async, non-blocking)
  const durationMs = Date.now() - startTime
  void (async () => {
    try {
      // Use embeddingModelId if available, otherwise skip logging
      if (args.embeddingModelId) {
        await logModelUsage({
          modelId: args.embeddingModelId,
          libraryId: args.libraryId,
          usageType: 'embedding',
          durationMs,
          tokensInput: embeddedFile.size, // Use text size as proxy for input tokens
          tokensOutput: embeddedFile.chunks, // Number of embeddings generated
        })
      }
    } catch (error) {
      // Usage tracking failures don't break the operation
      console.error('Failed to log embedding usage:', error)
    }
  })()

  return {
    success: true, //TODO: Is it a success if there are chunkErrors?
    timeout: embeddedFile.timeout || false,
    chunks: embeddedFile.chunks,
    chunkErrors: embeddedFile.chunkErrors,
    size: embeddedFile.size,
  }
}

const performValidation = async (args: {
  taskId: string
  timeoutSignal: AbortSignal
  extractionSubTasks: Array<{ extractionMethod: string; markdownFileName?: string | null; finishedAt?: Date | null }>
  extractionOptions?: string | null
  mimeType: string | null
  embeddingModelProvider: string | null
  embeddingModelName: string | null
  fileId: string
  fileName: string | null
  libraryId: string
  metadata: string | null
  markdownFileName?: string | null
}) => {
  console.log(`🔍 Starting validation phase for task ${args.taskId}`)

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

  console.log(`✅ Validation passed for task ${args.taskId}`)
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
    let result: ConverterResult

    switch (args.extractionMethod) {
      case 'docx-extraction':
        result = await transformDocxToMarkdown(args.uploadFilePath)
        break

      case 'excel-extraction':
        result = await transformExcelToMarkdown(args.uploadFilePath, args.timeoutSignal)
        break

      case 'csv-extraction':
        result = await transformCsvToMarkdown(args.uploadFilePath, args.timeoutSignal)
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
        result = await transformPdfToImageToMarkdown(
          args.uploadFilePath,
          args.timeoutSignal,
          args.extractionOptions.ocrImageScale,
          args.extractionOptions.ocrPrompt,
          args.ocrModel.provider,
          args.ocrModel.name,
          args.extractionOptions.ocrTimeout * 1000, // Convert seconds to milliseconds
          args.extractionOptions.ocrMaxConsecutiveRepeats,
        )
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
      model:
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
    console.error(`❌ Error in extraction phase for task ${args.taskId}:`, error)
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

    console.log(`Processing ${pendingTasks.length} tasks... (capacity: ${availableCapacity})`)

    // Process tasks in parallel
    await Promise.all(pendingTasks.map((task) => processTask({ task })))
  } catch (error) {
    console.error('Error in content processing worker processQueue:', error)
  }
}

export async function startContentProcessingWorker() {
  if (isWorkerRunning) {
    console.log('Content processing worker is already running')
    return
  }

  isWorkerRunning = true
  console.log('🚀 Starting content processing worker...')

  // Process queue immediately
  await processQueue()

  // Set up interval to process queue
  workerInterval = setInterval(async () => {
    await processQueue()
  }, WORKER_INTERVAL_MS)
}

export function stopContentProcessingWorker() {
  if (!isWorkerRunning) {
    console.log('Content processing worker is not running')
    return
  }

  isWorkerRunning = false

  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
  }

  console.log('🛑 Stopped content processing worker')
}

export function isContentProcessingWorkerRunning(): boolean {
  return isWorkerRunning
}
