import { StorageStats } from '../schema'

export function subtractStorageStats(minuend: StorageStats, subtrahend: StorageStats): StorageStats {
  return {
    extractionBytes: minuend.extractionBytes - subtrahend.extractionBytes,
    physicalBytes: minuend.physicalBytes - subtrahend.physicalBytes,
    attachmentBytes: minuend.attachmentBytes - subtrahend.attachmentBytes,
    extractionFileCount: minuend.extractionFileCount - subtrahend.extractionFileCount,
    attachmentFileCount: minuend.attachmentFileCount - subtrahend.attachmentFileCount,
    physicalFileCount: minuend.physicalFileCount - subtrahend.physicalFileCount,
    lastUpdate: new Date().toISOString(),
  }
}
