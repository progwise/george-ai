import { prisma } from '@george-ai/app-database'
import { deleteUserFolder } from '@george-ai/file-management'

import { logger } from '../common'

export async function deleteUser(userId: string): Promise<void> {
  logger.info('Deleting user', { userId })

  const result = await prisma.$transaction(async (tx) => {
    const dbResult = await tx.user.delete({
      where: { id: userId },
    })

    const fileResult = await deleteUserFolder(userId)

    return { dbResult, fileResult }
  })

  logger.debug('Deleted user', { userId, result })
}
