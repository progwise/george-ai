import { Prisma } from '@george-ai/prismaClient'

import { prisma } from '../../prisma'
import { getAvailableMethodsForMimeType } from './extraction-method-registry'
import { ExtractionMethodId, serializeExtractionOptions } from './extraction-options-validation'

interface TaskQuery {
  include?: Prisma.AiFileContentExtractionTaskInclude
  select?: Prisma.AiFileContentExtractionTaskSelect
}
export interface CreateExtractionTaskOptions {
  fileId: string
  libraryId: string
  extractionMethod: ExtractionMethodId
  extractionOptions?: Record<string, unknown>
  timeoutMs?: number
  query?: TaskQuery
}

/**
 * Create a single content extraction task
 */
export const createContentExtractionTask = async (options: CreateExtractionTaskOptions) => {
  const { fileId, libraryId, extractionMethod, extractionOptions, timeoutMs, query } = options

  // Serialize options if provided
  const optionsJson = extractionOptions ? serializeExtractionOptions(extractionMethod, extractionOptions) : null

  const task = await prisma.aiFileContentExtractionTask.create({
    ...query,
    data: {
      fileId,
      libraryId,
      extractionMethod,
      extractionOptions: optionsJson,
      timeoutMs,
    },
  })

  console.log(`Created content extraction task ${task.id} for file ${fileId} with method ${extractionMethod}`)
  return task
}

/**
 * Create extraction tasks for a file using library default methods
 */
export const createDefaultExtractionTasksForFile = async (fileId: string, query?: TaskQuery) => {
  const file = await prisma.aiLibraryFile.findUniqueOrThrow({
    where: { id: fileId },
    include: {
      library: {
        select: {
          id: true,
          name: true,
          embeddingModelName: true,
          embeddingTimeoutMs: true,
          fileConverterOptions: true,
        },
      },
    },
  })

  // Get available extraction methods for this file type
  const availableMethods = getAvailableMethodsForMimeType(file.mimeType)

  if (availableMethods.length === 0) {
    throw new Error(`No extraction methods available for mime type: ${file.mimeType}`)
  }

  // TODO: Use configured library methods
  console.log(
    `Configured converter options for libary ${file.library.name}: ${file.library.fileConverterOptions || 'none'}`,
  )
  // For now, create task for the first available method
  // In the future, library settings could specify which methods to use
  const primaryMethod = availableMethods[0]

  const task = await createContentExtractionTask({
    fileId,
    libraryId: file.libraryId,
    extractionMethod: primaryMethod.id,
    extractionOptions: primaryMethod.defaultOptions,
    timeoutMs: file.library.embeddingTimeoutMs || 5 * 60 * 1000, // 5 minutes default
    query,
  })

  return [task]
}

/**
 * Create an embedding-only task using existing markdown from another task
 */
interface CreateEmbeddingOnlyTaskParams {
  existingTaskId?: string | undefined | null
  query?: TaskQuery
}
export const createEmbeddingOnlyTask = async (
  fileId: string,
  { existingTaskId, query }: CreateEmbeddingOnlyTaskParams,
) => {
  const file = await prisma.aiLibraryFile.findUniqueOrThrow({
    where: { id: fileId },
    include: {
      library: {
        select: {
          id: true,
          embeddingModelName: true,
          embeddingTimeoutMs: true,
        },
      },
    },
  })

  if (!file.library.embeddingModelName) {
    throw new Error(`Library ${file.libraryId} has no configured embedding model`)
  }

  let markdownFileName: string | null = null
  let extractionFinishedAt: Date | null = null

  // If existingTaskId is provided, get the markdown file from that task
  if (existingTaskId) {
    const existingTask = await prisma.aiFileContentExtractionTask.findUniqueOrThrow({
      where: { id: existingTaskId },
      select: {
        markdownFileName: true,
        extractionFinishedAt: true,
        fileId: true,
      },
    })

    if (existingTask.fileId !== fileId) {
      throw new Error(`Task ${existingTaskId} is not for file ${fileId}`)
    }

    if (!existingTask.markdownFileName || !existingTask.extractionFinishedAt) {
      throw new Error(`Task ${existingTaskId} has not completed extraction yet`)
    }

    markdownFileName = existingTask.markdownFileName
    extractionFinishedAt = existingTask.extractionFinishedAt
  }

  // Create a special "embedding-only" task
  const task = await prisma.aiFileContentExtractionTask.create({
    ...query,
    data: {
      fileId,
      libraryId: file.libraryId,
      extractionMethod: 'embedding-only', // Special method for embedding existing markdown
      markdownFileName,
      extractionFinishedAt, // Use the date from the existing task or null if no existing task
      embeddingModelName: file.library.embeddingModelName,
      timeoutMs: file.library.embeddingTimeoutMs || 180000, // Use library setting or default
    },
  })

  console.log(
    `Created embedding-only task ${task.id} for file ${fileId}${existingTaskId ? ` using markdown from task ${existingTaskId}` : ''}`,
  )
  return task
}
