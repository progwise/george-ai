import { prisma } from '@george-ai/app-database'
import { WorkspaceManifest, library } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { DomainError } from '../error'
import { logger } from './common'

export async function clearDocuments(workspace: WorkspaceManifest, params: { libraryId: string }): Promise<number> {
  const { workspaceId } = workspace
  const { modelDriver, modelName } = workspace?.settings?.embedding || {}

  if (!workspace || !modelDriver || !modelName) {
    logger.error('Workspace manifest does not contain embedding settings', { workspaceId, workspace })
    throw new DomainError('Workspace manifest not found', 'workspace')
  }
  const { resultDb } = await prisma.$transaction(async (tx) => {
    const resultDb = await tx.aiLibraryFile.deleteMany({
      where: {
        libraryId: params.libraryId,
        library: {
          workspaceId,
        },
      },
    })

    const resultFs = await library.clearDocuments(workspaceId, params)

    const resultVectorStore = await vectorStore.removeChunks({
      workspaceId,
      modelDriver,
      modelName,
      libraryId: params.libraryId,
    })

    return { resultDb, resultFs, resultVectorStore }
  })
  return resultDb.count
}
