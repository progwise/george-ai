import { prisma } from '@george-ai/app-database'
import { document, library } from '@george-ai/file-management'

import { logger } from '../common'
import { DomainError } from '../error'

export async function createDocument(
  workspaceId: string,
  parameters: {
    libraryId: string
    name: string
    mimeType: string
    originUri: string
    crawledByCrawlerId?: string
    originModificationDate?: Date
    originalContentHash?: string | null
  },
): Promise<{ documentId: string }> {
  const libraryManifest = await library.get(workspaceId, {
    libraryId: parameters.libraryId,
  })
  if (!libraryManifest) {
    logger.error('Library not found when trying to create document', { workspaceId, libraryId: parameters.libraryId })
    throw new DomainError('Library not found', 'document')
  }

  const fileExistsInDatabase = await prisma.aiLibraryFile.findUnique({
    where: { libraryId_originUri: { libraryId: parameters.libraryId, originUri: parameters.originUri } },
    select: { id: true },
  })

  if (fileExistsInDatabase) {
    logger.error('Document with the same origin URI already exists in the library', {
      workspaceId,
      parameters,
      existingFileId: fileExistsInDatabase.id,
    })
    throw new DomainError('Document with the same origin URI already exists in the library', 'document')
  }

  const { libraryId, name, mimeType, originUri, crawledByCrawlerId, originModificationDate, originalContentHash } =
    parameters

  try {
    const result = await prisma.$transaction(async (tx) => {
      const file = await tx.aiLibraryFile.create({
        data: {
          name,
          mimeType,
          libraryId,
          originUri,
          crawledByCrawlerId,
          originModificationDate,
        },
        select: {
          id: true,
        },
      })

      await document.create(workspaceId, {
        libraryId,
        documentId: file.id,
        name,
        mimeType,
        uri: originUri,
        originHash: originalContentHash ?? undefined,
        creationDate: originModificationDate ?? undefined,
        lastModifiedDate: originModificationDate ?? undefined,
      })

      return { documentId: file.id }
    })

    return result
  } catch (error) {
    logger.error('Error creating document', { error, workspaceId, parameters })
    throw new DomainError('Failed to create document.', 'document')
  }
}
