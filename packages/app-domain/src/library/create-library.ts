import { prisma } from '@george-ai/app-database'
import { library as lib } from '@george-ai/file-management'

import { logger } from './common'

export async function createLibrary(
  workspaceId: string,
  params: { name: string; description?: string },
): Promise<{ libraryId: string }> {
  const { name, description } = params
  logger.debug('Creating library', { workspaceId, name, description })

  const result = await prisma.$transaction(async (tx) => {
    const library = await tx.aiLibrary.create({
      select: {
        id: true,
      },
      data: {
        workspaceId,
        name,
        description,
        createdAt: new Date(),
      },
    })

    const manifest = await lib.create(workspaceId, { libraryId: library.id, name })
    return { library, manifest }
  })

  logger.debug('Library created', { workspaceId, result })

  return {
    libraryId: result.library.id,
  }
}
