import { Stream } from 'stream'

import { prisma } from '@george-ai/app-database'
import { document } from '@george-ai/file-management'

import { DomainError } from '../error'
import { logger } from './common'

export async function uploadFile(
  workspaceId: string,
  parameters: {
    libraryId: string
    fileId: string
    stream: Stream.Readable
  },
) {
  logger.info('Uploading File', { workspaceId, parameters })

  const { libraryId, fileId, stream } = parameters

  const [fileManifest, fileRecord] = await Promise.all([
    document.get(workspaceId, { libraryId, documentId: fileId }),
    prisma.aiLibraryFile.findUnique({
      where: { id: fileId, libraryId, library: { workspaceId } },
      select: { originUri: true, name: true, mimeType: true, originModificationDate: true, crawledByCrawlerId: true },
    }),
  ])

  if (!fileManifest || !fileRecord) {
    logger.error('File not found when trying to upload file', { workspaceId, parameters, fileManifest, fileRecord })
    throw new DomainError('File not found', 'file')
  }

  const result = await prisma.$transaction(async (tx) => {
    const startedAt = new Date()
    const updateBefore = await tx.fileUploads.updateMany({
      where: { fileId, startedAt: null, finishedAt: null, createdAt: { gte: new Date(Date.now() - 1000 * 60 * 10) } },
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
        'file',
      )
    }

    const { ack, nack } = await document.writeSource(workspaceId, {
      libraryId,
      documentId: fileId,
      stream,
    })

    try {
      const finishedAt = new Date()
      const updateAfter = await tx.fileUploads.updateMany({
        where: { fileId, startedAt, finishedAt: null },
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

  logger.info('Source file uploaded', {
    parameters,
    result,
  })

  return result
}
