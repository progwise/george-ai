import { deleteFile } from '../file-system'
import { getFilePath } from '../file-system/get-file-path'
import { getUserPath } from './get-user-path'

export async function deleteUserFile(userId: string, parameters: { fileName: string }): Promise<void> {
  const { fileName } = parameters
  const folderPath = await getUserPath(userId)
  const filePath = getFilePath(folderPath, fileName)

  await deleteFile(filePath)
}
