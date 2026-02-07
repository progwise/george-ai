import { prisma } from '@george-ai/app-database'

import { logger } from '../common'
import { DomainError } from '../error'

export const getWorkspaceId = async (parameters: { libraryId?: string; fileId?: string }) => {
  const { libraryId, fileId } = parameters
  if (fileId) {
    const file = await prisma.aiLibraryFile
      .findUniqueOrThrow({
        where: { id: fileId },
        select: {
          library: {
            select: { workspaceId: true },
          },
        },
      })
      .catch(() => {
        logger.error('File not found', { fileId })
        throw new DomainError('File not found', 'workspace')
      })
    return file.library.workspaceId
  }
  if (libraryId) {
    const library = await prisma.aiLibrary
      .findUniqueOrThrow({
        where: { id: libraryId },
        select: { workspaceId: true },
      })
      .catch(() => {
        logger.error('Library not found', { libraryId })
        throw new DomainError('Library not found', 'workspace')
      })
    return library.workspaceId
  }
  logger.error('Neither libraryId nor fileId provided', { parameters })
  throw new DomainError('Either libraryId or fileId must be provided', 'workspace')
}
