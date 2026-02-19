import { existsFile, getFilePath } from '../file-system'
import { getUserPath } from './get-user-path'

export async function existsUserFile(userId: string, parameters: { filename: string }): Promise<boolean> {
  const { filename } = parameters
  const userFolderPath = await getUserPath(userId)
  const filePath = getFilePath(userFolderPath, filename)
  const exists = await existsFile(filePath)
  return exists
}
