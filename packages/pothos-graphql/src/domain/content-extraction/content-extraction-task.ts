import {
  type ExtractionMethodId,
  isMethodAvailableForMimeType,
  parseFileConverterOptions,
  serializeFileConverterOptions,
} from '@george-ai/file-converter'

import { AiContentProcessingTaskInclude, AiContentProcessingTaskSelect } from '../../../prisma/generated/models'
import { prisma } from '../../prisma'
import { getLatestExtractionMarkdownFileNames } from '../file/markdown'

interface TaskQuery {
  include?: AiContentProcessingTaskInclude
  select?: AiContentProcessingTaskSelect
}
export interface CreateProcessingTaskOptions {
  fileId: string
  libraryId: string
  query?: TaskQuery
}

/**
 * Create a single content extraction task
 */
export const createContentProcessingTask = async (options: CreateProcessingTaskOptions) => {
  const { fileId, libraryId, query } = options

  const library = await prisma.aiLibrary.findUniqueOrThrow({
    where: { id: libraryId },
    select: {
      id: true,
      fileConverterOptions: true,
      embeddingModel: { select: { name: true } },
      embeddingTimeoutMs: true,
    },
  })

  const file = await prisma.aiLibraryFile.findUniqueOrThrow({
    where: { id: fileId },
    select: { id: true, mimeType: true },
  })

  const converterOptions = parseFileConverterOptions(library.fileConverterOptions)
  console.log(`Library ${libraryId} converter options:`, converterOptions)
  const extractionOptions = serializeFileConverterOptions(converterOptions)

  // Determine extraction methods based on MIME type
  const extractionMethods: ExtractionMethodId[] = []

  // Map MIME types to their primary extraction methods
  const mimeType = file.mimeType?.toLowerCase()
  switch (mimeType) {
    case 'message/rfc822':
      extractionMethods.push('eml-extraction')
      break
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      extractionMethods.push('docx-extraction')
      break
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
      extractionMethods.push('excel-extraction')
      break
    case 'text/csv':
    case 'application/csv':
      extractionMethods.push('csv-extraction')
      break
    case 'text/html':
    case 'application/xhtml+xml':
      extractionMethods.push('html-extraction')
      break
    case 'application/pdf':
      extractionMethods.push('text-extraction')
      // Add image-based extraction if enabled
      if (converterOptions.enableImageProcessing) {
        extractionMethods.push('pdf-image-llm')
      }
      break
    case 'text/plain':
    case 'text/markdown':
    case 'text/x-markdown':
      extractionMethods.push('text-extraction')
      break
    default:
      // Fallback to text extraction for unknown types
      console.warn(`Unknown MIME type "${file.mimeType}" for file ${fileId}, falling back to text-extraction`)
      extractionMethods.push('text-extraction')
      break
  }

  if (!library.embeddingModel) {
    throw new Error(`Library ${libraryId} has no configured embedding model`)
  }

  const timeoutMs = library.embeddingTimeoutMs

  // Filter to ensure methods are valid for the MIME type (safety check)
  const appliedExtractionMethods = extractionMethods.filter((method) => {
    return isMethodAvailableForMimeType(method, file.mimeType)
  })
  // Serialize options if provided
  const task = await prisma.aiContentProcessingTask.create({
    ...query,
    data: {
      fileId,
      libraryId,
      extractionOptions,
      embeddingModelName: library.embeddingModel.name,
      extractionSubTasks: {
        create: appliedExtractionMethods.map((method) => ({ extractionMethod: method })),
      },
      timeoutMs: timeoutMs || 5 * 60 * 1000, // Default to 5 minutes
    },
  })

  return task
}

/**
 * Create an embedding-only task using existing markdowns from another task
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
          fileConverterOptions: true,
          embeddingModel: { select: { name: true } },
          embeddingTimeoutMs: true,
        },
      },
    },
  })

  if (!file.library.embeddingModel) {
    throw new Error(`Library ${file.libraryId} has no configured embedding model`)
  }

  const availableMarkdowns: Array<{ markdownFileName: string; extractionFinishedAt: Date }> = []

  if (existingTaskId) {
    const existingTask = await prisma.aiContentProcessingTask.findUniqueOrThrow({
      where: { id: existingTaskId },
      select: {
        extractionSubTasks: true,
        extractionFinishedAt: true,
        fileId: true,
      },
    })

    if (existingTask.fileId !== fileId) {
      throw new Error(`Task ${existingTaskId} is not for file ${fileId}`)
    }

    const existingSubTasks = existingTask.extractionSubTasks.filter(
      (subTask) => subTask.markdownFileName && subTask.finishedAt,
    )

    if (existingSubTasks.length === 0) {
      throw new Error(`Task ${existingTaskId} has no successfully extracted markdown files to use for embeddings`)
    }

    availableMarkdowns.push(
      ...existingSubTasks.map((subTask) => ({
        markdownFileName: subTask.markdownFileName!,
        extractionFinishedAt: subTask.finishedAt!,
      })),
    )
  } else {
    const latestMarkdownFileNames = await getLatestExtractionMarkdownFileNames({ fileId, libraryId: file.libraryId })
    if (latestMarkdownFileNames.length === 0) {
      throw new Error(`No existing extracted markdown files found for file ${fileId}`)
    }

    availableMarkdowns.push(
      ...latestMarkdownFileNames.map((fileName) => ({
        markdownFileName: fileName,
        extractionFinishedAt: new Date(), // We don't know the exact date, so use now
      })),
    )
  }

  // Create a special "embedding-only" task
  const task = await prisma.aiContentProcessingTask.create({
    ...query,
    data: {
      fileId,
      libraryId: file.libraryId,
      extractionSubTasks: {
        create: availableMarkdowns.map(({ markdownFileName }) => ({
          extractionMethod: 'embedding-only',
          markdownFileName,
        })),
      },
      // Special embedding-only method that uses existing markdown
      // and only creates embeddings
      embeddingModelName: file.library.embeddingModel.name,
      timeoutMs: file.library.embeddingTimeoutMs || 180000, // Use library setting or default
    },
  })

  console.log(
    `Created embedding-only task ${task.id} for file ${fileId}${existingTaskId ? ` using markdown from task ${existingTaskId}` : ''}`,
  )
  return task
}
