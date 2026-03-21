import { StorageStats } from '../schema'

export function addStorageStats(summands: StorageStats[]): StorageStats {
  return {
    analysesBytes: summands.reduce((acc, usage) => acc + usage.analysesBytes, 0),
    extractionBytes: summands.reduce((acc, usage) => acc + usage.extractionBytes, 0),
    attachmentBytes: summands.reduce((acc, usage) => acc + usage.attachmentBytes, 0),
    physicalBytes: summands.reduce((acc, usage) => acc + usage.physicalBytes, 0),

    analysesFileCount: summands.reduce((acc, usage) => acc + usage.analysesFileCount, 0),
    extractionFileCount: summands.reduce((acc, usage) => acc + usage.extractionFileCount, 0),
    attachmentFileCount: summands.reduce((acc, usage) => acc + usage.attachmentFileCount, 0),
    physicalFileCount: summands.reduce((acc, usage) => acc + usage.physicalFileCount, 0),
    lastUpdate: new Date(),
  }
}
