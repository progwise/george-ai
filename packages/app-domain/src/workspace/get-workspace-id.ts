import { prisma } from '@george-ai/app-database'

import { DomainError } from '../error'

export async function getWorkspaceId({ libraryId, fileId }: { libraryId?: string; fileId?: string }) {
  if (!libraryId && !fileId) {
    throw new DomainError('Either libraryId or fileId must be provided to get the workspaceId.', 'workspace')
  }

  if (fileId) {
    const file = await prisma.aiLibraryFile.findFirstOrThrow({
      where: { id: fileId },
      select: { libraryId: true, library: { select: { workspaceId: true } } },
    })
    if (libraryId && file.libraryId !== libraryId) {
      throw new DomainError(
        `The provided libraryId: ${libraryId} does not match the libraryId: ${file.libraryId} associated with fileId: ${fileId}.`,
        'workspace',
      )
    }
    return file.library.workspaceId
  }

  const library = await prisma.aiLibrary.findFirstOrThrow({
    where: { id: libraryId },
    select: { workspaceId: true },
  })

  return library.workspaceId
}
