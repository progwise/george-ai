import { fs } from '../commons'
import { DocumentIdentifier, ExtractionIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'
import { getEntryPath } from './get-entry-path'

export async function entryExists(
  identifier: WorkspaceIdentifier | LibraryIdentifier | DocumentIdentifier | ExtractionIdentifier,
): Promise<boolean> {
  const entryFolderPath = getEntryPath(identifier)
  const manifestPath = fs.getFilePath(entryFolderPath, 'manifest.json')
  return await fs.existsFile(manifestPath)
}
