import { deleteFile, existsFile, getFilePath } from '../file-system'
import { getAssistantIconNames } from './get-assistant-icon-names'
import { getAssistantPath } from './get-assistant-path'

export async function deleteAssistantIcons(assistantId: string): Promise<void> {
  const fileNames = getAssistantIconNames(assistantId)
  const folderPath = await getAssistantPath(assistantId)

  await Promise.all(
    fileNames.map(async (fileName) => {
      const filePath = getFilePath(folderPath, fileName)
      if (await existsFile(filePath)) {
        await deleteFile(filePath)
      }
    }),
  )
}
