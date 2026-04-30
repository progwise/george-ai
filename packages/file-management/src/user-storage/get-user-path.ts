import { ensureFolderOnce, getFolderPath } from '../file-system'
import { userStorageRoot } from './commons'

export async function getUserPath(userId: string): Promise<string> {
  const userFolderPath = getFolderPath(userStorageRoot, userId)
  await ensureFolderOnce(userFolderPath)
  return userFolderPath
}
