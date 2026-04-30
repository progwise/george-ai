import { listFiles } from '../file-system'
import { getUserPath } from './get-user-path'

export async function listUserFiles(userId: string): Promise<string[]> {
  const userFolderPath = await getUserPath(userId)
  return listFiles(userFolderPath)
}
