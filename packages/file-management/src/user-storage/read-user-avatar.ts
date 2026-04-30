import { Readable } from 'node:stream'

import { getFilePath, getFileStats } from '../file-system'
import { logger } from './commons'
import { getUserAvatarNames } from './get-user-avatar-names'
import { getUserPath } from './get-user-path'
import { readUserFile } from './read-user-file'

export async function readUserAvatar(
  userId: string,
): Promise<{ stream: Readable; size: number; mimeType: string; fileName: string } | null> {
  const fileNames = getUserAvatarNames(userId)
  const userPath = await getUserPath(userId)

  const fileNamesExist = await Promise.all(
    fileNames.map(async (name) => ({
      fileName: name,
      stats: await getFileStats(getFilePath(userPath, name)),
    })),
  )

  const sortedFiles = fileNamesExist
    .filter(({ stats }) => stats)
    .sort((a, b) => b.stats!.modified.getTime() - a.stats!.modified.getTime())

  if (!sortedFiles.length) {
    logger.warn(`User avatar not found`, { userId })
    return null
  }

  return await readUserFile(userId, { fileName: sortedFiles[0].fileName })
}
