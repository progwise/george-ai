import { prisma } from '@george-ai/app-database'
import { WorkspaceManifest, library } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { DomainError } from '../error'
import { logger } from './common'

export async function deleteLibrary(workspace: WorkspaceManifest, options: { libraryId: string }): Promise<void> {
  const { libraryId } = options

  const { workspaceId, settings } = workspace
  const { modelDriver, modelName } = settings?.embedding || {}
  logger.debug('deleteLibrary', { workspaceId, libraryId })

  if (!workspace || !modelDriver || !modelName) {
    logger.error('Workspace manifest does not contain embedding settings', { workspaceId, workspace })
    throw new DomainError('Workspace manifest not found', 'workspace')
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.aiLibraryFile.deleteMany({
        where: {
          libraryId,
        },
      })
      await tx.aiLibrary.deleteMany({
        where: {
          workspaceId,
          id: libraryId,
        },
      })

      await Promise.all([
        vectorStore.removeChunks({ workspaceId, modelDriver, modelName, libraryId }),
        library.delete(workspaceId, { libraryId }),
      ])
    })
  } catch (error) {
    logger.error('Error deleting library', { error, workspaceId, libraryId })
    throw new DomainError('Failed to delete library.', 'workspace')
  }
}
