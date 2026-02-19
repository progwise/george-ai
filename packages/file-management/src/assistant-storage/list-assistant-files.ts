import { listFiles } from '../file-system'
import { getAssistantPath } from './get-assistant-path'

export async function listAssistantFiles(assistantId: string): Promise<string[]> {
  const assistantFolderPath = await getAssistantPath(assistantId)
  return listFiles(assistantFolderPath)
}
