import { getModelProvider } from '@george-ai/app-commons'
import { AiLibraryInclude, AiLibrarySelect } from '@george-ai/app-database'
import { prisma } from '@george-ai/app-database'
import { getLibrary, saveLibrary } from '@george-ai/file-management'

import { logger } from '../common'
import { DomainError } from '../error'
import { LibraryInput } from './library-input'

export async function updateLibrary(parameters: {
  workspaceId: string
  libraryId: string
  data: LibraryInput
  query?: {
    include?: AiLibraryInclude
    select?: AiLibrarySelect
  }
}) {
  const { workspaceId, libraryId, data, query } = parameters

  logger.info('Updating library', { workspaceId, libraryId, data })

  const result = await prisma?.$transaction(async (tx) => {
    const aiLibrary = await tx.aiLibrary.update({
      ...query,
      where: { id: libraryId, workspaceId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.url !== undefined && { url: data.url }),
        ...(data.embeddingModelId !== undefined && { embeddingModelId: data.embeddingModelId }),
        ...(data.fileConverterOptions !== undefined && { fileConverterOptions: data.fileConverterOptions }),
        ...(data.embeddingTimeoutMs !== undefined && { embeddingTimeoutMs: data.embeddingTimeoutMs }),
        ...(data.autoProcessCrawledFiles !== undefined && { autoProcessCrawledFiles: !!data.autoProcessCrawledFiles }),
      },
    })

    const libraryManifest = await getLibrary({ workspaceId, libraryId })
    if (!libraryManifest) {
      logger.error('Library manifest not found in library update', { workspaceId, libraryId })
      throw new DomainError('Library not found', 'library')
    }

    libraryManifest.name = aiLibrary.name
    libraryManifest.updated = new Date()

    const modelIds = [aiLibrary.embeddingModelId, aiLibrary.extractionModelId, aiLibrary.ocrModelId].filter(
      (id): id is string => !!id,
    )

    if (modelIds.length > 0) {
      const aiModels = await tx.aiLanguageModel.findMany({
        where: { id: { in: modelIds } },
      })

      const embeddingModel = aiModels.find((model) => model.id === aiLibrary.embeddingModelId)
      const ocrModel = aiModels.find((model) => model.id === aiLibrary.ocrModelId)

      const embeddingSettings = embeddingModel
        ? { modelName: embeddingModel.name, provider: getModelProvider(embeddingModel.provider) }
        : libraryManifest.settings?.embedding
      const imageAnalysisSettings = ocrModel
        ? { modelName: ocrModel.name, provider: getModelProvider(ocrModel.provider) }
        : libraryManifest.settings?.imageAnalysis

      libraryManifest.settings = {
        ...libraryManifest.settings,
        ...(embeddingSettings ? { embedding: embeddingSettings } : libraryManifest.settings?.embedding),
        ...(imageAnalysisSettings ? { imageAnalysis: imageAnalysisSettings } : libraryManifest.settings?.imageAnalysis),
      }
    }

    await saveLibrary({ workspaceId, libraryId }, libraryManifest)

    return { aiLibrary, manifest: libraryManifest }
  })

  if (!result) {
    throw new Error('Failed to update library')
  }

  return {
    ...result,
  }
}
