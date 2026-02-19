import { fs, logger } from '../commons'
import { entryExists } from '../entry/entry-exists'
import { createLibrary } from '../library'
import { reconcileLibrary } from '../reconcile'
import { DocumentIdentifier, LibraryIdentifier, WorkspaceIdentifier } from '../schema'
import { createWorkspace } from '../workspace'
import { LegacyFileLoader } from './legacy-file-loader'
import { migrateLegacyDocument } from './migrate-legacy-document'

export async function migrateLegacyLibrary(
  workspaceId: string,
  args: {
    libraryId: string
    libraryName: string
    workspaceName: string
    fileInfoLoader: LegacyFileLoader
  },
): Promise<void> {
  const { libraryId, libraryName, workspaceName } = args
  const workspaceIdentifier: WorkspaceIdentifier = { workspaceId, type: 'workspace', version: 1 }
  const workspaceExists = await entryExists(workspaceIdentifier)
  if (!workspaceExists) {
    logger.info('Workspace does not exist, creating workspace before upgrading legacy library', {
      ...workspaceIdentifier,
      workspaceName,
    })
    await createWorkspace(workspaceId, { name: workspaceName })
  }
  const libraryIdentifier: LibraryIdentifier = {
    ...workspaceIdentifier,
    type: 'library',
    libraryId,
  }
  const libraryExists = await entryExists(libraryIdentifier)
  if (!libraryExists) {
    logger.info('Library does not exist, creating', { ...libraryIdentifier, libraryName })
    await createLibrary(workspaceId, { libraryId, name: libraryName })
  }

  const legacyLibraryDir = fs.getFolderPath(fs.getRootPath(), libraryId)
  const legacyFiles = await fs.listFolders(legacyLibraryDir)

  for (const entry of legacyFiles) {
    const documentIdentifier: DocumentIdentifier = {
      ...libraryIdentifier,
      documentId: entry,
      type: 'document',
    }
    const legacyFileInfo = await args.fileInfoLoader(entry)
    if (!legacyFileInfo) {
      logger.warn('File info not found during legacy file upgrade, skipping file', documentIdentifier)
      continue
    }
    try {
      await migrateLegacyDocument(workspaceId, legacyFileInfo)
    } catch (error) {
      logger.error('Error upgrading legacy file', { ...documentIdentifier, error })
    }
  }

  await reconcileLibrary(libraryIdentifier)
  return
}
