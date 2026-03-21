import { StorageStats } from '../schema'

export function sanitizeStorageStats(storageStats: StorageStats): StorageStats {
  return {
    analysesBytes: Math.max(0, storageStats.analysesBytes),
    analysesFileCount: Math.max(0, storageStats.analysesFileCount),
    extractionBytes: Math.max(0, storageStats.extractionBytes),
    physicalBytes: Math.max(0, storageStats.physicalBytes),
    attachmentBytes: Math.max(0, storageStats.attachmentBytes),
    extractionFileCount: Math.max(0, storageStats.extractionFileCount),
    attachmentFileCount: Math.max(0, storageStats.attachmentFileCount),
    physicalFileCount: Math.max(0, storageStats.physicalFileCount),
    lastUpdate: new Date(),
  }
}
