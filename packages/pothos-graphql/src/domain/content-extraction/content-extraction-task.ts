import { AiContentProcessingTaskInclude, AiContentProcessingTaskSelect } from '@george-ai/app-domain'
import { prisma } from '@george-ai/app-domain'
import {
  type ExtractionMethodId,
  isMethodAvailableForMimeType,
  parseFileConverterOptions,
  serializeFileConverterOptions,
} from '@george-ai/file-converter'

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
      embeddingModel: { select: { id: true, provider: true, name: true } },
      embeddingTimeoutMs: true,
      ocrModel: { select: { id: true, provider: true, name: true } },
    },
  })

  const file = await prisma.aiLibraryFile.findUniqueOrThrow({
    where: { id: fileId },
    select: { id: true, mimeType: true },
  })

  const converterOptions = {
    ...parseFileConverterOptions(library.fileConverterOptions),
    ocrModel: library.ocrModel || undefined,
  }
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
      embeddingModelId: library.embeddingModel.id,
      extractionSubTasks: {
        create: appliedExtractionMethods.map((method) => ({ extractionMethod: method })),
      },
      timeoutMs: timeoutMs || 5 * 60 * 1000, // Default to 5 minutes
    },
  })

  return task
}
