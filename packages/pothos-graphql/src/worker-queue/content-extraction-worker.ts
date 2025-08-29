import fs from 'fs'
import path from 'node:path'

import {
  type ConverterResult,
  transformCsvToMarkdown,
  transformDocxToMarkdown,
  transformExcelToMarkdown,
  transformHtmlToMarkdown,
  transformPdfToImageToMarkdown,
  transformPdfToMarkdown,
  transformTextToMarkdown,
} from '@george-ai/file-converter'
import { getFileDir, getUploadFilePath, saveMarkdownContent } from '@george-ai/file-management'
import { embedMarkdownFile } from '@george-ai/langchain-chat'
import { Prisma } from '@george-ai/prismaClient'
import { createTimeoutSignal, mergeObjectToJsonString } from '@george-ai/web-utils'

import { isMethodAvailableForMimeType } from '../domain'
import {
  type ExtractionMethodId,
  PdfImageLlmOptions,
  isValidExtractionMethod,
  validateExtractionOptions,
} from '../domain/content-extraction/extraction-options-validation'
import { prisma } from '../prisma'

let isWorkerRunning = false
let workerInterval: NodeJS.Timeout | null = null

const WORKER_INTERVAL_MS = 5000 // Process queue every 5 seconds
const MAX_CONCURRENT_PROCESSINGS = 3 // Maximum concurrent extractions

// Track concurrent extraction calls
let processingCount = 0

type ProcessingTaskRecord = Prisma.AiFileContentExtractionTaskGetPayload<{
  include: {
    file: {
      select: {
        id: true
        name: true
        originUri: true
        mimeType: true
        libraryId: true
        library: { select: { embeddingModelName: true } }
      }
    }
  }
}>

const updateProcessingTask = async (args: {
  task: ProcessingTaskRecord
  timeoutSignal: AbortSignal
  data: object
}): Promise<ProcessingTaskRecord> => {
  const update = await prisma.aiFileContentExtractionTask.update({
    where: { id: args.task.id },
    data: args.data,
  })
  if (args.timeoutSignal.aborted) {
    console.error(`❌ Task ${args.task.id} aborted due to timeout`)
    throw new Error('Operation aborted')
  }
  return { ...args.task, ...update }
}

async function processTask(args: { task: ProcessingTaskRecord }) {
  processingCount++

  let task: ProcessingTaskRecord = { ...args.task }

  const { timeoutSignal, clearTimeoutSignal } = createTimeoutSignal({
    timeoutMs: task.timeoutMs || 30 * 60 * 1000,
    onTimeout: async () => {
      await prisma.aiFileContentExtractionTask.update({
        where: { id: task.id },
        data: {
          processingFailedAt: new Date(),
          processingTimeout: true,
        },
      })
    },
  })

  try {
    console.log(`🔄 Processing extraction task ${task.id} for file ${task.fileId} with method ${task.extractionMethod}`)

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
      extractionMethod: task.extractionMethod,
      extractionOptions: task.extractionOptions,
      mimeType: task.file.mimeType,
      embeddingModelName: task.file.library.embeddingModelName,
      fileId: task.fileId,
      fileName: task.file.name,
      libraryId: task.file.libraryId,
      metadata: task.metadata,
      markdownFileName: task.markdownFileName,
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

    if (validated.extractMethod !== 'embedding-only') {
      console.log(`🔄 Starting content extraction phase for task ${task.id}`)

      task = await updateProcessingTask({
        task,
        timeoutSignal,
        data: {
          extractionStartedAt: new Date(),
        },
      })

      // Perform the content extraction
      const extractionResult = await performContentExtraction({
        taskId: task.id,
        timeoutSignal,
        fileId: task.fileId,
        libraryId: task.file.libraryId,
        extractionMethod: validated.extractMethod as ExtractionMethodId,
        extractionOptions: validated.extractionOptions,
        uploadFilePath: validated.uploadFilePath!,
        mimeType: task.file.mimeType,
      })

      if (!extractionResult.success) {
        task = await updateProcessingTask({
          task,
          timeoutSignal,
          data: {
            extractionFailedAt: new Date(),
            processingFailedAt: new Date(),
            metadata: mergeObjectToJsonString(task.metadata, {
              extractionError:
                extractionResult.error instanceof Error ? extractionResult.error.message : 'Unknown error', // TODO: Not loosing metadata from previous steps
            }),
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
            markdownFileName: extractionResult.result!.markdownFileName,
            extractionTimeout: extractionResult.result!.timeout || false,
            metadata: mergeObjectToJsonString(task.metadata, extractionResult.result), // TODO: Not loosing metadata from previous steps
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
    if (!task.markdownFileName) {
      await updateProcessingTask({
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
    const embeddingResult = await processEmbeddingPhase({
      taskId: task.id,
      timeoutSignal,
      fileId: task.fileId,
      fileName: task.file.name!,
      originUri: task.file.originUri,
      mimeType: task.file.mimeType!,
      libraryId: task.file.libraryId,
      markdownFileName: task.markdownFileName,
      embeddingModelName: validated.embeddingModelName,
    })
    if (!embeddingResult.success) {
      task = await updateProcessingTask({
        task,
        timeoutSignal,
        data: {
          embeddingFailedAt: new Date(),
          processingFailedAt: new Date(),
          metadata: mergeObjectToJsonString(task.metadata, {
            embeddingError: embeddingResult?.error instanceof Error ? embeddingResult.error.message : 'Unknown error',
          }),
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
          embeddingTimeout: embeddingResult.timeout || false,
          processingFinishedAt: new Date(),
          metadata: mergeObjectToJsonString(task.metadata, {
            embeddingCompletedAt: new Date().toISOString(),
            embeddingModel: validated.embeddingModelName,
            embeddingSuccess: true,
            embeddingError: null,
            embeddingTimeout: embeddingResult.timeout || false,
          }),
          chunksCount: embeddingResult?.chunks || 0,
          chunksSize: embeddingResult?.size || 0,
        },
      })
    }
    console.log(`✅ Completed embedding phase for task ${task.id}`)
  } catch (error) {
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
          metadata: mergeObjectToJsonString(task?.metadata, {
            infrastructureError: error instanceof Error ? error.message : 'Unknown infrastructure error',
            timestamp: new Date().toISOString(),
          }),
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
  embeddingModelName: string
}) => {
  try {
    console.log(`🔗 Starting embedding phase for task ${args.taskId}`)

    // Get markdown file path
    const markdownPath = path.join(
      getFileDir({ fileId: args.fileId, libraryId: args.libraryId }),
      args.markdownFileName,
    )

    // Use embedFile function (embeddingModelName validated in validation phase)
    const embeddedFile = await embedMarkdownFile({
      timeoutSignal: args.timeoutSignal,
      libraryId: args.libraryId,
      embeddingModelName: args.embeddingModelName,
      fileId: args.fileId,
      fileName: args.fileName,
      originUri: args.originUri || '',
      mimeType: args.mimeType,
      markdownFilePath: markdownPath,
    })

    return {
      success: true,
      timeout: embeddedFile.timeout || false,
      chunks: embeddedFile.chunks,
      size: embeddedFile.size,
    }
  } catch (error) {
    return { success: false, error }
  }
}

const performValidation = async (args: {
  taskId: string
  timeoutSignal: AbortSignal
  extractionMethod: string
  extractionOptions?: string | null
  mimeType: string | null
  embeddingModelName: string | null
  fileId: string
  fileName: string | null
  libraryId: string
  metadata: string | null
  markdownFileName?: string | null
}) => {
  console.log(`🔍 Starting validation phase for task ${args.taskId}`)

  const errors: string[] = []

  if (args.extractionMethod === 'embedding-only') {
    if (!args.markdownFileName) errors.push('No markdown file specified for embedding-only task')
  } else if (
    !isValidExtractionMethod(args.extractionMethod) ||
    !isMethodAvailableForMimeType(args.extractionMethod, args.mimeType || '')
  ) {
    errors.push(`Unsupported extraction method: ${args.extractionMethod}`)
  }

  // Validate embedding model is configured
  if (!args.embeddingModelName) {
    errors.push(`Library embedding model not configured`)
  }
  // Get uploaded file path

  const uploadFilePath =
    args.extractionMethod !== 'embedding-only'
      ? getUploadFilePath({ fileId: args.fileId, libraryId: args.libraryId })
      : null

  // Check if uploaded file exists
  if (uploadFilePath && !fs.existsSync(uploadFilePath)) {
    errors.push(`Upload file not found: ${uploadFilePath}`)
  }

  // Validate and get options
  const extractionOptions = isValidExtractionMethod(args.extractionMethod)
    ? validateExtractionOptions(args.extractionMethod, args.extractionOptions)
    : null

  if (extractionOptions && !extractionOptions.success) {
    const { error } = extractionOptions
    errors.push(`Invalid extraction options: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  console.log(`✅ Validation passed for task ${args.taskId}`)
  return {
    success: true,
    validated: {
      extractMethod: args.extractionMethod,
      extractionOptions: extractionOptions?.data ? extractionOptions.data : {},
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
  extractionOptions: Record<string, unknown>
  uploadFilePath: string
  mimeType: string
}) => {
  try {
    // Process based on extraction method
    let result: ConverterResult

    switch (args.extractionMethod) {
      case 'pdf-text-extraction':
        result = await transformPdfToMarkdown(args.uploadFilePath, args.timeoutSignal)
        break

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

      case 'text-extraction': {
        result = await transformTextToMarkdown(args.uploadFilePath, args.mimeType)
        break
      }

      case 'pdf-image-llm': {
        const ocrOptions = args.extractionOptions as PdfImageLlmOptions
        result = await transformPdfToImageToMarkdown(
          args.uploadFilePath,
          args.timeoutSignal,
          ocrOptions.imageScale,
          ocrOptions.ocrPrompt,
          ocrOptions.ocrModel,
          ocrOptions.ocrTimeoutPerPage,
        )
        break
      }

      default:
        throw new Error(`Unsupported extraction method: ${args.extractionMethod}`)
    }

    // Save markdown file
    const markdownFileName = await saveMarkdownContent(
      args.fileId,
      args.libraryId,
      args.extractionMethod as ExtractionMethodId,
      result.markdownContent,
    )

    return {
      success: true,
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
    const pendingTasks = await prisma.aiFileContentExtractionTask.findMany({
      include: {
        file: {
          select: {
            id: true,
            name: true,
            originUri: true,
            mimeType: true,
            libraryId: true,
            library: { select: { embeddingModelName: true } },
          },
        },
      },
      where: {
        processingStartedAt: null, // Only get tasks that haven't been picked up yet
      },
      orderBy: { createdAt: 'asc' }, // Process oldest tasks first
      take: availableCapacity,
    })

    if (pendingTasks.length === 0) {
      return
    }

    console.log(`Processing ${pendingTasks.length} extraction tasks... (capacity: ${availableCapacity})`)

    // Process tasks in parallel
    await Promise.all(pendingTasks.map((task) => processTask({ task })))
  } catch (error) {
    console.error('Error in content extraction worker processQueue:', error)
  }
}

export async function startContentExtractionWorker() {
  if (isWorkerRunning) {
    console.log('Content extraction worker is already running')
    return
  }

  isWorkerRunning = true
  console.log('🚀 Starting content extraction worker...')

  // Process queue immediately and wait for completion
  await processQueue()

  // Set up interval to process queue
  workerInterval = setInterval(async () => {
    await processQueue()
  }, WORKER_INTERVAL_MS)
}

export function stopContentExtractionWorker() {
  if (!isWorkerRunning) {
    console.log('Content extraction worker is not running')
    return
  }

  isWorkerRunning = false

  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
  }

  console.log('🛑 Stopped content extraction worker')
}
