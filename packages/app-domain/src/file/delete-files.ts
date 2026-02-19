import { prisma } from '@george-ai/app-database'
import { document, library } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { DomainError } from '../error'
import { logger } from './common'

export async function deleteFiles(
  workspaceId: string,
  parameters: {
    libraryId: string
    documentIds?: string[]
  },
): Promise<number> {
  const { libraryId, documentIds } = parameters
  logger.debug('deleteFile', { workspaceId, libraryId, documentIds })

  try {
    const count = await prisma.$transaction(async (tx) => {
      const { count } = await tx.aiLibraryFile.deleteMany({
        where: {
          library: {
            workspaceId,
          },
          libraryId,
          ...(documentIds ? { id: { in: documentIds } } : {}),
        },
      })

      if (documentIds) {
        await Promise.all(
          documentIds.flatMap((documentId) => [
            // TODO: why not renaming fileId to documentId in vector store?
            vectorStore.removeChunks({ workspaceId, libraryId, fileId: documentId }),
            document.delete(workspaceId, { libraryId, documentId }),
          ]),
        )
      } else {
        await Promise.all([
          vectorStore.removeChunks({ workspaceId, libraryId }),
          library.clearDocuments(workspaceId, { libraryId }),
        ])
      }

      return count
    })
    return count
  } catch (error) {
    logger.error('Error deleting Files', { error, workspaceId, libraryId, documentIds })
    throw new DomainError('Failed to delete files.', 'workspace')
  }
}
