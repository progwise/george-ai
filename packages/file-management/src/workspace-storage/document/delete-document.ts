import { DocumentIdentifier } from '../..'
import { fs } from '../commons'
import { getEntryOrThrow, getEntryPath } from '../entry'
import { updateStats } from '../storage-stats'

export async function deleteDocumentEx(
  workspaceId: string,
  args: { libraryId: string; documentId: string },
): Promise<void> {
  return await deleteDocument({ workspaceId, ...args, type: 'document', version: 1 })
}

export async function deleteDocument(identifier: DocumentIdentifier): Promise<void> {
  const libraryManifest = await getEntryOrThrow({ ...identifier, type: 'library' })
  const documentManifest = await getEntryOrThrow({ ...identifier, type: 'document' })

  const documentPath = getEntryPath(identifier)
  await fs.deleteFolder(documentPath)

  await updateStats(libraryManifest, {
    stats: documentManifest.storageStats,
    operation: 'subtract',
  })
}
