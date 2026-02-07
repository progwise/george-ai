import { prisma } from '@george-ai/app-database'
import { workspaceStorage } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { DomainError } from '../error'
import { logger } from './common'

export async function deleteLibrary(workspaceId: string, options: { libraryId: string }): Promise<void> {
  const { libraryId } = options
  logger.debug('deleteLibrary', { workspaceId, libraryId })

  try {
    await prisma.$transaction(async (tx) => {
      await tx.aiLibrary.deleteMany({
        where: {
          workspaceId,
          id: libraryId,
        },
      })

      await Promise.all([
        vectorStore.removeChunks({ workspaceId, libraryId }),
        workspaceStorage.deleteLibrary(workspaceId, { libraryId }),
      ])
    })
  } catch (error) {
    logger.error('Error deleting library', { error, workspaceId, libraryId })
    throw new DomainError('Failed to delete library.', 'workspace')
  }
}
