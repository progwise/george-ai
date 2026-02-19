import { deleteFile } from '../file-system'
import { getFilePath } from '../file-system/get-file-path'
import { getAssistantPath } from './get-assistant-path'

export async function deleteAssistantFile(assistantId: string, parameters: { fileName: string }): Promise<void> {
  const { fileName } = parameters
  const folderPath = await getAssistantPath(assistantId)
  const filePath = getFilePath(folderPath, fileName)

  await deleteFile(filePath)
}
