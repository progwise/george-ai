import { WriteStream } from 'node:fs'

import { getConfigValue } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'
import { createUserAvatarFile } from '@george-ai/file-management'

import { logger } from './common'

export async function createUserAvatar(userId: string, fileExtension: string): Promise<{ writeStream: WriteStream }> {
  const writeAvatarStream = await createUserAvatarFile({
    userId,
    fileName: `avatar.${fileExtension}`,
  })

  writeAvatarStream.on('close', async () => {
    logger.debug('Avatar for user  has been saved', { userId })
    await prisma.user.update({
      where: { id: userId },
      data: {
        avatarUrl: `${getConfigValue('BACKEND_PUBLIC_URL')}/avatar?userId=${userId}&updated=${Date.now()}`,
      },
    })
  })

  writeAvatarStream.on('error', async (error) => {
    logger.error(`Error writing avatar for user ${userId}:`, error)
  })

  return {
    writeStream: writeAvatarStream,
  }
}
