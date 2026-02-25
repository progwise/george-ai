import { entryExists } from '../entry'

export async function existsWorkspace(workspaceId: string): Promise<boolean> {
  const result = await entryExists({ workspaceId, type: 'workspace', version: 1 })
  return result
}
