import { prisma } from '@george-ai/app-database'
import { InferenceDriver } from '@george-ai/app-schema'
import { EmbeddingRequest, invokeAction } from '@george-ai/event-service-client'
import { WorkspaceManifest, getWorkspace } from '@george-ai/file-management'
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
  settings?: {
    storageLimitFiles?: number | null
    storageLimitBytes?: number | null
    embedding?: {
      modelDriver: InferenceDriver
      modelName: string
    } | null
    imageAnalysis?: {
      modelDriver: InferenceDriver
      modelName: string
    } | null
  } | null
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
        ...(settings.imageAnalysis && { imageAnalysis: settings.imageAnalysis }),
      },
    }),
  }

  const { modelDriver, modelName } = updatedManifest.settings?.embedding || {}
  logger.debug('Updating workspace', { workspaceId, name, settings, modelDriver, modelName })
  if (modelDriver && modelName) {
    const testEmbedding = await invokeAction({
      action: 'chunkEmbedding',
      workspaceId,
      version: 1,
      modelName,
      verb: 'request',
      timestamp: new Date(),
      driver: modelDriver,
      chunks: ['test'],
    } satisfies EmbeddingRequest)
    const size = testEmbedding.embeddings[0].vector.length
    const store = await vectorStore.getVectorStore({
      workspaceId,
      modelDriver,
      modelName,
    })
    if (store.exists && store.vectorDimensions === size) {
      await saveWorkspace(updatedManifest)
      return updatedManifest
    }
    if (store.exists && store.vectorDimensions !== size) {
      await vectorStore.removeVectorStore({
        workspaceId,
        modelDriver,
        modelName,
      })
    }

    await vectorStore.createVectorStore({
      workspaceId,
      model: {
        modelDriver,
        modelName,
        size,
        distance: 'Cosine', // still no idea where to get this information from
      },
    })
  }

  await saveWorkspace(updatedManifest)

  return updatedManifest
}
