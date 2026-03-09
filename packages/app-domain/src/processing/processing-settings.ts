import { prisma } from '@george-ai/app-database'
import { ExtractionMethod, InferenceDriver, InferenceDriverSchema } from '@george-ai/app-schema'

export interface ProcessingSettings {
  extractionMethods: Array<ExtractionMethod>
  embeddingModelDriver: InferenceDriver
  embeddingModelName: string
}

const getCacheKey = (params: { workspaceId: string; libraryId?: string; listId?: string; automationId?: string }) => {
  return `${params.workspaceId}-${params.libraryId ?? '*'}-${params.listId ?? '*'}-${params.automationId ?? ''}`
}

const cache = new Map<string, ProcessingSettings & { timestamp: Date }>()

const cleanupInterval = setInterval(
  () => {
    const now = new Date()
    for (const [libraryId, cached] of cache.entries()) {
      if (now.getTime() - cached.timestamp.getTime() >= 5 * 60 * 1000) {
        cache.delete(libraryId)
      }
    }
  },
  5 * 60 * 1000,
)

cleanupInterval.unref()

export async function getProcessingSettings(parameters: {
  workspaceId: string
  libraryId?: string
  listId?: string
  automationId?: string
}): Promise<ProcessingSettings> {
  const now = new Date()
  const cacheKey = getCacheKey(parameters)
  const cached = cache.get(cacheKey)
  if (cached && now.getTime() - cached.timestamp.getTime() < 5 * 60 * 1000) {
    return cached
  }
  const library = await prisma.aiLibrary.findUniqueOrThrow({
    where: { id: parameters.libraryId },
    select: { workspaceId: true, embeddingModel: { select: { provider: true, name: true } } },
  })

  const embeddingModel = library.embeddingModel

  if (!embeddingModel) {
    throw new Error('Embedding model not configured for the library')
  }

  const settings: ProcessingSettings = {
    extractionMethods: [
      'csvExtraction',
      'textExtraction',
      'pdfExtraction',
      'docxExtraction',
      'emlExtraction',
      'htmlExtraction',
      'excelExtraction',
    ],
    embeddingModelDriver: InferenceDriverSchema.parse(embeddingModel.provider),
    embeddingModelName: embeddingModel.name,
  }

  cache.set(cacheKey, { ...settings, timestamp: now })
  return settings
}
