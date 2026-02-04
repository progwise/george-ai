import { prisma } from '@george-ai/app-database'
import { workspaceStorage } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { logger } from '../common'
import { DomainError } from '../error'

export async function migrateWorkspace(parameters: { workspaceId: string }): Promise<boolean> {
  const { workspaceId } = parameters

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, name: true, libraries: { select: { id: true, name: true, embeddingModel: true } } },
  })

  if (!workspace) {
    logger.error('Workspace not found for migration', { workspaceId })
    throw new DomainError('Workspace not found', 'workspace')
  }

  await workspaceStorage.migrateWorkspace(workspaceId, {
    workspaceName: workspace.name,
    libraries: workspace.libraries,
    fileInfoLoader: async (fileId: string) => {
      const fileInfo = await prisma.aiLibraryFile.findUnique({
        where: { id: fileId },
        select: {
          libraryId: true,
          id: true,
          name: true,
          mimeType: true,
          createdAt: true,
          uploadedAt: true,
          originFileHash: true,
        },
      })

      if (!fileInfo) {
        logger.error('File info not found during migration', { workspaceId, fileId })
        throw new DomainError('File info not found', 'workspace')
      }
      return {
        workspaceId,
        libraryId: fileInfo.libraryId,
        fileId,
        fileName: fileInfo.name,
        mimeType: fileInfo.mimeType,
        createdAt: fileInfo.createdAt.toISOString(),
      }
    },
  })

  const vectorStoreExists = await vectorStore.existsWorkspace(workspaceId)
  if (!vectorStoreExists) {
    logger.info('Vector store does not exist for workspace, creating new vector store', { workspaceId })
    const embeddingModels = workspace.libraries.map((library) => ({
      libraryId: library.id,
      embeddingModelProvider: library.embeddingModel?.provider,
      embeddingModelName: library.embeddingModel?.name,
    }))

    const vectors: Record<string, { size: number; distance: 'Cosine' | 'Dot' | 'Euclid' | 'Manhattan' }> = {}
    for (const model of embeddingModels) {
      if (!model.embeddingModelProvider || !model.embeddingModelName) {
        logger.warn('Library does not have embedding model configured, skipping during vector store creation', {
          workspaceId,
          model,
        })
        continue
      }
      vectors[model.embeddingModelName] = {
        size: 3000,
        distance: 'Cosine',
      }
    }

    await vectorStore.createWorkspace({ workspaceId, vectors })
  }
  return true
}
