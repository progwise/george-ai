import { prisma } from '@george-ai/app-database'
import { InferenceDriver } from '@george-ai/app-schema'
import { WorkspaceManifest, getWorkspace } from '@george-ai/file-management'
import { saveWorkspace } from '@george-ai/file-management'

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
        ...(settings.storageLimitFiles && { storageLimitFiles: settings.storageLimitFiles }),
        ...(settings.storageLimitBytes && { storageLimitBytes: settings.storageLimitBytes }),
        ...(settings.embedding && { embedding: settings.embedding }),
        ...(settings.imageAnalysis && { imageAnalysis: settings.imageAnalysis }),
      },
    }),
  }

  await saveWorkspace(updatedManifest)

  return updatedManifest
}
