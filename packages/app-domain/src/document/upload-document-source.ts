import { Stream } from 'stream'

import { prisma } from '@george-ai/app-database'
import { document } from '@george-ai/file-management'

import { logger } from '../common'
import { DomainError } from '../error'

export async function uploadDocumentSource(
  workspaceId: string,
  parameters: {
    libraryId: string
    documentId: string
    stream: Stream.Readable
  },
) {
  logger.debug('Uploading File', { workspaceId, parameters })

  const { libraryId, documentId, stream } = parameters

  const [documentManifest, file] = await Promise.all([
    document.get({ workspaceId, libraryId, documentId }),
    prisma.aiLibraryFile.findUnique({
      where: { id: documentId, libraryId, library: { workspaceId } },
      select: { originUri: true, name: true, mimeType: true, originModificationDate: true, crawledByCrawlerId: true },
    }),
  ])

  if (!documentManifest || !file) {
    logger.error('Document not found when trying to upload document source', {
      workspaceId,
      parameters,
      file,
      documentManifest,
    })
    throw new DomainError('Document not found', 'document')
  }

  const result = await prisma.$transaction(async (tx) => {
    const startedAt = new Date()
    const updateBefore = await tx.fileUploads.updateMany({
      where: {
        fileId: documentId,
        startedAt: null,
        finishedAt: null,
        createdAt: { gte: new Date(Date.now() - 1000 * 60 * 10) },
      },
      data: {
        startedAt,
      },
    })

    if (updateBefore.count === 0) {
      logger.error(
        'No upload record found to update. Either the file is already being uploaded or the upload record has expired.',
        { workspaceId, parameters },
      )
      throw new DomainError(
        'No upload record found to update. Either the file is already being uploaded or the upload record has expired.',
        'document',
      )
    }

    const { ack, nack } = await document.writeSource(workspaceId, {
      libraryId,
      documentId,
      stream,
    })

    try {
      const finishedAt = new Date()
      const updateAfter = await tx.fileUploads.updateMany({
        where: { fileId: documentId, startedAt, finishedAt: null },
        data: {
          finishedAt,
        },
      })

      if (updateAfter.count === 0) {
        logger.error(
          'No upload record found to update with finishedAt. This should not happen as we just updated the startedAt. Please investigate.',
          { workspaceId, parameters },
        )
        throw new DomainError(
          'No upload record found to update with finishedAt. This should not happen as we just updated the startedAt. Please investigate.',
          'file',
        )
      }

      const manifest = await ack()
      return manifest
    } catch (error) {
      logger.error('Error while updating upload record with finishedAt. Attempting to nack the upload.', {
        workspaceId,
        parameters,
        error,
      })
      await nack(error instanceof Error ? error : new Error('Unknown error during upload'))
      throw error
    }
  })

  logger.debug('Source file uploaded', {
    parameters,
    result,
  })

  return result
}
