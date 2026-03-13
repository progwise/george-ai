import { getConfigValue } from '@george-ai/app-commons'

import { fs, logger } from '../commons'
import { entryExists } from '../entry/entry-exists'
import { createLibrary } from '../library'
import { reconcileLibrary } from '../reconcile'
import { LibraryIdentifier, LibraryManifest, WorkspaceIdentifier } from '../schema'
import { LegacyFileInfo, LegacyFileLoader } from './legacy-file-loader'

export async function migrateLibrary(
  workspaceId: string,
  args: {
    libraryId: string
    libraryName: string
    fileInfoLoader: LegacyFileLoader
  },
): Promise<{
  libraryManifest: LibraryManifest
  legacyFileInfos: Array<LegacyFileInfo>
}> {
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

  const existsLegacyLibraryDir = await fs.existsFolder(legacyLibraryDir)
  if (!existsLegacyLibraryDir) {
    logger.info('Legacy library folder does not exist, skipping', { legacyLibraryDir, libraryId, libraryName })
    return { libraryManifest: await reconcileLibrary(libraryIdentifier), legacyFileInfos: [] }
  }
  const legacyFiles = await fs.listFolders(legacyLibraryDir)

  const legacyFileInfos: Array<LegacyFileInfo> = []
  for (const entry of legacyFiles) {
    const legacyFileInfo = await args.fileInfoLoader(entry)
    if (!legacyFileInfo) {
      logger.warn('File info not found during legacy file upgrade, skipping file', {
        workspaceId,
        libraryId,
        legacyLibraryDir,
        fileId: entry,
      })
      continue
    }

    legacyFileInfos.push(legacyFileInfo)
  }

  return { libraryManifest: await reconcileLibrary(libraryIdentifier), legacyFileInfos }
}
