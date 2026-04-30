import { ensureFolderOnce, getFolderPath } from '../file-system'
import { assistantStorageRoot } from './commons'

export async function getAssistantPath(assistantId: string): Promise<string> {
  const assistantPath = getFolderPath(assistantStorageRoot, assistantId)
  await ensureFolderOnce(assistantPath)
  return assistantPath
}
