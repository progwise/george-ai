import { prisma } from '@george-ai/app-database'
import { EmbeddingRequest, invokeAction } from '@george-ai/event-service-client'
import { WorkspaceManifest, WorkspaceSettings, getWorkspace } from '@george-ai/file-management'
import { saveWorkspace } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { logger } from '../common'

export async function updateWorkspace({
  workspaceId,
  name,
  settings,
}: {
  workspaceId: string
  name?: string | null
  settings?: WorkspaceSettings | null
}) {
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(!!name && { name }),
      updatedAt: new Date(),
    },
  })

  const manifest = await getWorkspace(workspaceId)
  if (!manifest) {
    throw new Error('Workspace not found after update')
  }

  const updatedManifest: WorkspaceManifest = {
    ...manifest,
    ...(name && { name }),
    ...(settings && {
      settings: {
        ...manifest.settings,
        ...(settings.storageLimitFiles != null && { storageLimitFiles: settings.storageLimitFiles }),
        ...(settings.storageLimitBytes != null && { storageLimitBytes: settings.storageLimitBytes }),
        ...(settings.embedding && { embedding: settings.embedding }),
        ...(settings.vision && { vision: settings.vision }),
      },
    }),
  }

  const { embedding, vision } = updatedManifest.settings || {}

  if (embedding?.modelDriver && embedding.modelName) {
    const testEmbedding = await invokeAction({
      action: 'chunkEmbedding',
      workspaceId,
      version: 1,
      modelName: embedding.modelName,
      verb: 'request',
      timestamp: new Date(),
      driver: embedding.modelDriver,
      chunks: ['test'],
    } satisfies EmbeddingRequest)
    const size = testEmbedding.embeddings[0].vector.length
    const store = await vectorStore.getVectorStore({
      workspaceId,
      modelDriver: embedding.modelDriver,
      modelName: embedding.modelName,
    })
    if (store.exists && store.vectorDimensions !== size) {
      await vectorStore.removeVectorStore({
        workspaceId,
        modelDriver: embedding.modelDriver,
        modelName: embedding.modelName,
      })
    }
    if (!store.exists || store.vectorDimensions !== size) {
      await vectorStore.createVectorStore({
        workspaceId,
        model: {
          modelDriver: embedding.modelDriver,
          modelName: embedding.modelName,
          size,
          distance: 'Cosine', // still no idea where to get this information from
        },
      })
    }
  }

  logger.debug('Updating workspace', { workspaceId, name, settings, embedding, vision })
  await saveWorkspace(updatedManifest)

  return updatedManifest
}
