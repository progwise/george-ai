import { entryExists } from '../entry'

export async function existsDocument(
  workspaceId: string,
  parameters: { libraryId: string; documentId: string },
): Promise<boolean> {
  const result = await entryExists({ ...parameters, workspaceId, type: 'document', version: 1 })
  return result
}
