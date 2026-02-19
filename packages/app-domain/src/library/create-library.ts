import { prisma } from '@george-ai/app-database'
import { library } from '@george-ai/file-management'

import { logger } from './common'

export async function createLibrary(
  workspaceId: string,
  params: { name: string; userId: string },
): Promise<{ libraryId: string }> {
  const { name, userId } = params
  logger.info('Creating library', { workspaceId, name })

  try {
    const result = await prisma.$transaction(async (tx) => {
      const library = await tx.aiLibrary.create({
        select: {
          id: true,
        },
        data: {
          workspaceId,
          name,
          createdAt: new Date(),
          ownerId: userId,
        },
      })
      return library
    })

    await library.create(workspaceId, { libraryId: result.id, name })
    logger.info('Library created in storage', { workspaceId, libraryId: result.id, name })

    return {
      libraryId: result.id,
    }
  } catch (error) {
    logger.error('Error creating library', { error, workspaceId, name })
    throw error
  }
}
