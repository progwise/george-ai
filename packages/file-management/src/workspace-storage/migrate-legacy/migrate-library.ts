import { getConfigValue } from '@george-ai/app-commons'

import { fs, logger } from '../commons'
import { entryExists } from '../entry/entry-exists'
import { createLibrary } from '../library'
import { reconcileLibrary } from '../reconcile'
import { DocumentIdentifier, LibraryIdentifier, LibraryManifest, WorkspaceIdentifier } from '../schema'
import { LegacyFileLoader } from './legacy-file-loader'
import { migrateDocument } from './migrate-document'

export async function migrateLibrary(
  workspaceId: string,
  args: {
    libraryId: string
    libraryName: string
    fileInfoLoader: LegacyFileLoader
  },
): Promise<LibraryManifest> {
  const { libraryId, libraryName } = args
  const workspaceIdentifier: WorkspaceIdentifier = { workspaceId, type: 'workspace', version: 1 }
  const workspaceExists = await entryExists(workspaceIdentifier)
  if (!workspaceExists) {
    logger.error('Workspace does not exist, cannot continue', {
      workspaceId,
      args,
      workspaceIdentifier,
    })
    throw new Error('Workspace does not exist, cannot migrate library')
  }
  const libraryIdentifier: LibraryIdentifier = {
    ...workspaceIdentifier,
    type: 'library',
    libraryId,
  }
  const libraryExists = await entryExists(libraryIdentifier)
  if (!libraryExists) {
    logger.info('Library Manifest does not exist, creating', { ...libraryIdentifier, libraryName })
    await createLibrary(workspaceId, { libraryId, name: libraryName })
  }

  const legacyLibraryDir = fs.getFolderPath(getConfigValue('STORAGE_PATH_LEGACY_LIBRARIES'), libraryId)
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
      await migrateDocument(workspaceId, legacyFileInfo)
    } catch (error) {
      logger.error('Error upgrading legacy file', { ...documentIdentifier, error })
    }
  }

  return await reconcileLibrary(libraryIdentifier)
}
