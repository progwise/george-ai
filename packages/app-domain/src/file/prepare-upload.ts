import { prisma } from '@george-ai/app-database'
import { document } from '@george-ai/file-management'

import { logger } from '../common'
import { DomainError } from '../error'

export const prepareUpload = async (
  workspaceId: string,
  options: { libraryId: string; fileId: string; uploadUrl: string },
) => {
  const { libraryId, fileId, uploadUrl } = options

  const allSettled = await Promise.allSettled([
    prisma.fileUploads.create({
      select: { id: true },
      data: {
        fileId,
        uploadUrl,
      },
    }),
    document.exists(workspaceId, { libraryId, documentId: fileId }),
  ])

  const rejected = allSettled.filter((result): result is PromiseRejectedResult => result.status === 'rejected')
  if (rejected.length > 0) {
    logger.error('Error while creating file upload record', {
      workspaceId,
      options,
      errors: rejected.map((r) => r.reason),
    })
    throw new DomainError('Failed to prepare file upload', 'file')
  }

  const fulfilled = allSettled.filter(
    (result): result is PromiseFulfilledResult<{ id: string }> => result.status === 'fulfilled',
  )
  if (fulfilled.length === 0) {
    logger.error('No fulfilled result while creating file upload record', { workspaceId, options })
    throw new DomainError('Failed to prepare file upload', 'file')
  }

  const uploadId = fulfilled[0].value.id
  logger.info('Prepared file upload', { workspaceId, options, uploadId })

  return { uploadId }
}
