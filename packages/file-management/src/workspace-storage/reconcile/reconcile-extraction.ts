import { fs } from '../commons'
import { getAttachmentsPath, getEntry, getEntryPath, saveEntry } from '../entry'
import { ExtractionIdentifier, ExtractionManifest, ExtractionManifestSchema } from '../schema'

export async function reconcileExtraction(identifier: ExtractionIdentifier): Promise<ExtractionManifest> {
  const extractionManifest =
    (await getEntry(identifier)) || ExtractionManifestSchema.parse({ ...identifier, sourceHash: '' })

  const extractionPath = getEntryPath(identifier)
  const folderStats = await fs.calculateFolderStats(extractionPath)
  const attachmentsDir = getAttachmentsPath(identifier)
  const attachmentStats = await fs.calculateFolderStats(attachmentsDir).catch(() => ({
    diskSize: 0,
    fileCount: 0,
  }))

  return await saveEntry({
    ...extractionManifest,
    storageStats: {
      ...extractionManifest.storageStats,
      attachmentBytes: attachmentStats.diskSize,
      attachmentFileCount: attachmentStats.fileCount,
      extractionBytes: folderStats.diskSize,
      extractionFileCount: folderStats.fileCount,
      physicalBytes: folderStats.diskSize,
      physicalFileCount: folderStats.fileCount,
      lastReconcile: new Date(),
    },
  })
}
