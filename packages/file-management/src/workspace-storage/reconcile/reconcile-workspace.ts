import { fs, logger } from '../commons'
import { entryExists, getAttachmentsPath, getEntryOrThrow, getEntryPath, getLibrariesPath, saveEntry } from '../entry'
import { WorkspaceIdentifier, WorkspaceManifest } from '../schema'
import { reconcileLibrary } from './reconcile-library'

export async function reconcileWorkspace(identifier: WorkspaceIdentifier): Promise<WorkspaceManifest> {
  const workspaceManifest = await getEntryOrThrow(
    identifier,
    `Workspace manifest not found during reconciliation: ${identifier.workspaceId}`,
  )

  logger.debug('Reconciling workspace', workspaceManifest)

  const workspacePath = getEntryPath(identifier)
  const workspaceDirStats = await fs.calculateFolderStats(workspacePath)

  const attachmentsPath = getAttachmentsPath(identifier)
  const attachmentsStats = await fs.calculateFolderStats(attachmentsPath)

  const librariesPath = getLibrariesPath(identifier)
  const libraryFolderNames = await fs.listFolders(librariesPath)

  const librariesManifest = await Promise.all(
    (libraryFolderNames || []).map(async (folderName) => {
      const libraryId = folderName
      const libraryManifestExists = await entryExists({ ...identifier, type: 'library', libraryId })
      if (!libraryManifestExists) {
        logger.warn('Library manifest not found during reconciliation, skipping this library', {
          identifier,
          libraryId,
        })
        return null
      }
      return reconcileLibrary({ ...identifier, type: 'library', libraryId })
    }),
  )

  const updatedWorkspaceManifest: WorkspaceManifest = {
    ...workspaceManifest,
    storageStats: {
      ...workspaceManifest.storageStats,
      attachmentBytes: attachmentsStats.diskSize,
      attachmentFileCount: attachmentsStats.fileCount,
      extractionBytes: librariesManifest.reduce(
        (total, manifest) => total + (manifest?.storageStats.extractionBytes || 0),
        0,
      ),
      extractionFileCount: librariesManifest.reduce(
        (total, manifest) => total + (manifest?.storageStats.extractionFileCount || 0),
        0,
      ),
      physicalBytes: workspaceDirStats.diskSize,
      physicalFileCount: workspaceDirStats.fileCount,
      lastReconcile: new Date().toISOString(),
    },
  }

  return await saveEntry(updatedWorkspaceManifest)
}
