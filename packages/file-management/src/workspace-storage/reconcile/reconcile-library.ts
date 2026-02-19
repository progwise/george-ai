import { fs, logger } from '../commons'
import { entryExists, getAttachmentsPath, getDocumentsPath, getEntryOrThrow, getEntryPath, saveEntry } from '../entry'
import { LibraryIdentifier, LibraryManifest } from '../schema'
import { reconcileDocument } from './reconcile-document'

export async function reconcileLibrary(identifier: LibraryIdentifier): Promise<LibraryManifest> {
  const libraryManifest = await getEntryOrThrow(
    identifier,
    `Library manifest not found during reconciliation: ${identifier.libraryId}`,
  )

  logger.debug('Reconciling library', libraryManifest)

  const libraryPath = getEntryPath(identifier)
  const libDirStats = await fs.calculateFolderStats(libraryPath)

  const attachmentsPath = getAttachmentsPath(identifier)
  const attachmentsStats = await fs.calculateFolderStats(attachmentsPath)

  const documentsPath = getDocumentsPath(identifier)
  const documentFolderNames = await fs.listFolders(documentsPath)

  const documentManifests = await Promise.all(
    (documentFolderNames || []).map(async (folderName) => {
      const documentId = folderName
      const documentManifestExists = await entryExists({ ...identifier, type: 'document', documentId })
      if (!documentManifestExists) {
        logger.warn('Document manifest not found during reconciliation, skipping this document', {
          identifier,
          documentId,
        })
        return null
      }
      return reconcileDocument({ ...identifier, type: 'document', documentId })
    }),
  )

  const updatedLibraryManifest: LibraryManifest = {
    ...libraryManifest,
    storageStats: {
      ...libraryManifest.storageStats,
      attachmentBytes: attachmentsStats.diskSize,
      attachmentFileCount: attachmentsStats.fileCount,
      extractionBytes: documentManifests.reduce(
        (total, manifest) => total + (manifest?.storageStats.extractionBytes || 0),
        0,
      ),
      extractionFileCount: documentManifests.reduce(
        (total, manifest) => total + (manifest?.storageStats.extractionFileCount || 0),
        0,
      ),
      physicalBytes: libDirStats.diskSize,
      physicalFileCount: libDirStats.fileCount,
      lastReconcile: new Date().toISOString(),
    },
  }

  return await saveEntry(updatedLibraryManifest)
}
