import { entryExists } from '../entry'

export async function existsLibrary(workspaceId: string, parameters: { libraryId: string }): Promise<boolean> {
  const result = await entryExists({ ...parameters, workspaceId, type: 'library', version: 1 })
  return result
}
