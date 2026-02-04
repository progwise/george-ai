export const STORAGE_STATUS = ['Ready', 'hasLegacyData', 'NotFound'] as const
export type StorageStatus = (typeof STORAGE_STATUS)[number]
