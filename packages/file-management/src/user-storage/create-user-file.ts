import { WriteStream } from 'node:fs'

import { createFile, getFilePath } from '../file-system'
import { getUserPath } from './get-user-path'

export async function createUserFile(parameters: {
  userId: string
  fileName: string
}): Promise<{ writeStream: WriteStream }> {
  const { userId, fileName } = parameters
  const userPath = await getUserPath(userId)
  const filePath = getFilePath(userPath, fileName)

  return createFile(filePath)
}
