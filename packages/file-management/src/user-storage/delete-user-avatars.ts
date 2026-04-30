import { deleteFile, existsFile, getFilePath } from '../file-system'
import { getUserAvatarNames } from './get-user-avatar-names'
import { getUserPath } from './get-user-path'

export async function deleteUserAvatars(userId: string): Promise<void> {
  const fileNames = getUserAvatarNames(userId)
  const folderPath = await getUserPath(userId)

  await Promise.all(
    fileNames.map(async (fileName) => {
      const filePath = getFilePath(folderPath, fileName)
      if (await existsFile(filePath)) {
        await deleteFile(filePath)
      }
    }),
  )
}
