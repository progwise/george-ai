import { existsFile, getFilePath } from '../file-system'
import { getAssistantPath } from './get-assistant-path'

export async function existsAssistantFile(assistantId: string, parameters: { filename: string }): Promise<boolean> {
  const { filename } = parameters
  const assistantFolderPath = await getAssistantPath(assistantId)
  const filePath = getFilePath(assistantFolderPath, filename)
  return await existsFile(filePath)
}
