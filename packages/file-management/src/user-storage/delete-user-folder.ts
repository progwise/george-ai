import { deleteFolder, existsFolder, getFolderPath } from '../file-system'
import { userStorageRoot } from './commons'

export async function deleteUserFolder(userId: string): Promise<boolean> {
  const userFolderPath = getFolderPath(userStorageRoot, userId)
  const exists = await existsFolder(userFolderPath)
  if (!exists) {
    return false
  }

  await deleteFolder(userFolderPath)

  return true
}
