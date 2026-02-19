export interface LegacyFileInfo {
  libraryId: string
  fileId: string
  name: string
  originUri?: string | null
  mimeType: string
  crawledByCrawlerId?: string | null
  docPath?: string | null
  originFileHash?: string | null
  originModificationDate?: string | null
  createdAt: string
  uploadedAt?: string | null
  hash?: string | null
}

export type LegacyFileLoader = (fileId: string) => Promise<LegacyFileInfo | null>
