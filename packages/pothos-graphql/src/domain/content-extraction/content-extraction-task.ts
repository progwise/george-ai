import {
  type ExtractionMethodId,
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
      embeddingModelName: true,
      embeddingTimeoutMs: true,
    },
  })

  const converterOptions = parseFileConverterOptions(library.fileConverterOptions)
  console.log(`Library ${libraryId} converter options:`, converterOptions)
  const extractionOptions = serializeFileConverterOptions(converterOptions)

  const extractionMethods: ExtractionMethodId[] = []
  if (converterOptions.enableTextExtraction) {
    extractionMethods.push('text-extraction')
  }
  if (converterOptions.enableImageProcessing) {
    extractionMethods.push('pdf-image-llm')
  }
  if (extractionMethods.length === 0) {
    throw new Error(`No extraction methods enabled in library ${libraryId} converter options`)
  }
  if (!library.embeddingModelName) {
    throw new Error(`Library ${libraryId} has no configured embedding model`)
  }

  const timeoutMs = library.embeddingTimeoutMs
  // Serialize options if provided
  const task = await prisma.aiContentProcessingTask.create({
    ...query,
    data: {
      fileId,
      libraryId,
      extractionOptions,
      embeddingModelName: library.embeddingModelName,
      extractionSubTasks: {
        create: extractionMethods.map((method) => ({ extractionMethod: method })),
      },
      timeoutMs: timeoutMs || 5 * 60 * 1000, // Default to 5 minutes
    },
  })

  console.log(
    `Created content extraction task ${task.id} for file ${fileId} with methods ${extractionMethods.join(', ')}`,
  )
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
          embeddingModelName: true,
          embeddingTimeoutMs: true,
        },
      },
    },
  })

  if (!file.library.embeddingModelName) {
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
      embeddingModelName: file.library.embeddingModelName,
      timeoutMs: file.library.embeddingTimeoutMs || 180000, // Use library setting or default
    },
  })

  console.log(
    `Created embedding-only task ${task.id} for file ${fileId}${existingTaskId ? ` using markdown from task ${existingTaskId}` : ''}`,
  )
  return task
}
