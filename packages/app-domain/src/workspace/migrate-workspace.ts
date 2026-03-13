import { prisma } from '@george-ai/app-database'
import { WorkspaceManifest, getWorkspace, migrate } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { logger } from '../common'
import { DomainError } from '../error'

export async function migrateWorkspace(parameters: { workspaceId: string }): Promise<WorkspaceManifest> {
  const { workspaceId } = parameters

  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: { id: true, name: true, libraries: { select: { id: true, name: true, embeddingModel: true } } },
  })

  await migrate.migrateWorkspace(workspaceId, {
    workspaceName: workspace.name,
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

  const workspaceManifest = await getWorkspace(workspaceId)

  if (!workspaceManifest) {
    throw new DomainError('Failed to retrieve workspace manifest after migration', 'workspace')
  }
  return workspaceManifest
}
