import { getConfigValue } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'
import { document } from '@george-ai/file-management'

import { logger } from '../common'

export const prepareUpload = async (parameters: {
  workspaceId: string
  libraryId: string
  documentId?: string | null
  originUri: string
  mimeType: string
  name: string
  size?: number | null
  modificationDate?: Date | null
}) => {
  const { workspaceId, libraryId, documentId, originUri, mimeType, size, name, modificationDate } = parameters

  const result = await prisma.$transaction(async (tx) => {
    const file = await tx.aiLibraryFile.upsert({
      where: {
        ...(documentId ? { id: documentId } : { libraryId_originUri: { libraryId, originUri } }),
      },
      update: {
        name,
        originUri,
        mimeType,
        size,
        originModificationDate: modificationDate,
        updatedAt: new Date(),
      },
      create: {
        originUri,
        name,
        mimeType,
        originModificationDate: modificationDate,
        createdAt: new Date(),
        libraryId,
      },
    })

    let manifest = await document.get({ workspaceId, libraryId, documentId: file.id })
    if (!manifest) {
      manifest = await document.create(workspaceId, {
        documentId: file.id,
        libraryId,
        mimeType,
        name,
        uri: originUri,
      })
    } else {
      await document.save(workspaceId, {
        ...manifest,
        name,
        mimeType,
        origin: {
          ...manifest.origin,
          uri: originUri,
          ...(modificationDate ? { lastModifiedDate: modificationDate } : {}),
        },
      })
    }

    const fileUpload = await tx.fileUploads.create({
      select: { id: true },
      data: {
        fileId: file.id,
        uploadUrl: `${getConfigValue('BACKEND_PUBLIC_URL')}/upload`,
      },
    })

    return { file, manifest, fileUpload }
  })

  logger.debug('Prepared file upload', { workspaceId, result, parameters })

  return { uploadId: result.fileUpload.id, documentId: result.file.id }
}
