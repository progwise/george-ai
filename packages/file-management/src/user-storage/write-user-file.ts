import { Readable } from 'node:stream'

import { writeFile } from '../file-system'
import { getFilePath } from '../file-system/get-file-path'
import { getUserPath } from './get-user-path'

export async function writeUserFile(userId: string, parameters: { fileName: string; stream: Readable }): Promise<void> {
  const { fileName, stream } = parameters
  const userPath = await getUserPath(userId)
  const filePath = getFilePath(userPath, fileName)

  return await writeFile(filePath, stream)
}
