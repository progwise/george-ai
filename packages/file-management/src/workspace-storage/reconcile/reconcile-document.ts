import { getExtractionMethod } from '@george-ai/app-commons'

import { fs, logger } from '../commons'
import { calculateSourceHash } from '../document'
import { getAttachmentsPath, getEntryOrThrow, getEntryPath, getExtractionsPath, saveEntry } from '../entry'
import { DocumentIdentifier, DocumentManifest } from '../schema'
import { reconcileExtraction } from './reconcile-extraction'

export async function reconcileDocument(identifier: DocumentIdentifier): Promise<DocumentManifest> {
  const documentManifest = await getEntryOrThrow(
    identifier,
    `Document manifest not found during reconciliation: ${identifier.documentId}`,
  )

  logger.debug('Reconciling document', documentManifest)

  const sourceHash = await calculateSourceHash(identifier).catch((error) => {
    logger.warn('Error calculating source hash during reconciliation, setting sourceHash to null', {
      identifier,
      error,
    })
    return null
  })

  const documentPath = getEntryPath(identifier)
  const documentStats = await fs.calculateFolderStats(documentPath)

  const attachmentsPath = getAttachmentsPath(identifier)
  const attachmentsStats = await fs.calculateFolderStats(attachmentsPath)

  const extractionsPath = getExtractionsPath(identifier)
  const extractionFolderNames = await fs.listFolders(extractionsPath)

  const extractionManifests = await Promise.all(
    (extractionFolderNames || []).map((folderName) => {
      const extractionMethod = getExtractionMethod(folderName)
      if (!extractionMethod) {
        logger.warn('Unknown extraction folder found during reconciliation, skipping this extraction', {
          identifier,
          methodId: folderName,
        })
        return null
      }
      return reconcileExtraction({ ...identifier, type: 'extraction', extractionMethod })
    }),
  )

  const updatedDocumentManifest: DocumentManifest = {
    ...documentManifest,
    sourceHash: sourceHash,
    extractions: extractionManifests
      .filter((extractionManifest) => extractionManifest !== null)
      .map((manifest) => ({
        extractionMethod: manifest.extractionMethod,
        sourceHash: manifest.sourceHash,
        created: manifest.created,
        updated: manifest.updated,
      })),
    storageStats: {
      ...documentManifest.storageStats,
      attachmentBytes: attachmentsStats.diskSize,
      attachmentFileCount: attachmentsStats.fileCount,
      extractionBytes: extractionManifests.reduce(
        (sum, manifest) => sum + (manifest?.storageStats.extractionBytes || 0),
        0,
      ),
      extractionFileCount: extractionManifests.reduce(
        (sum, manifest) => sum + (manifest?.storageStats.extractionFileCount || 0),
        0,
      ),
      physicalBytes: documentStats.diskSize,
      physicalFileCount: documentStats.fileCount,
      lastReconcile: new Date(),
    },
  }

  return await saveEntry(updatedDocumentManifest)
}
