import { prisma } from '@george-ai/app-database'
import { workspaceStorage } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { DomainError } from '../error'
import { logger } from './common'

export async function deleteFiles(
  workspaceId: string,
  parameters: {
    libraryId: string
    fileIds?: string[]
  },
): Promise<number> {
  const { libraryId, fileIds } = parameters
  logger.debug('deleteFile', { workspaceId, libraryId, fileIds })

  try {
    const count = await prisma.$transaction(async (tx) => {
      const { count } = await tx.aiLibraryFile.deleteMany({
        where: {
          library: {
            workspaceId,
          },
          libraryId,
          ...(fileIds ? { id: { in: fileIds } } : {}),
        },
      })

      if (fileIds) {
        await Promise.all(
          fileIds.flatMap((fileId) => [
            vectorStore.removeChunks({ workspaceId, libraryId, fileId }),
            workspaceStorage.deleteFiles(workspaceId, { libraryId, fileId }),
          ]),
        )
      } else {
        await Promise.all([
          vectorStore.removeChunks({ workspaceId, libraryId }),
          workspaceStorage.deleteFiles(workspaceId, { libraryId }),
        ])
      }

      return count
    })
    return count
  } catch (error) {
    logger.error('Error deleting Files', { error, workspaceId, libraryId, fileIds })
    throw new DomainError('Failed to delete files.', 'workspace')
  }
}
