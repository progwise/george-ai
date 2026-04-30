export interface LegacyFileInfo {
  workspaceId: string
  libraryId: string
  fileId: string
  name: string
  mimeType: string
  originUri?: string | null
  crawledByCrawlerId?: string | null
  docPath?: string | null
  originFileHash?: string | null
  originModificationDate?: string | null
  createdAt: string
  uploadedAt?: string | null
  hash?: string | null
}

export type LegacyFileLoader = (fileId: string) => Promise<LegacyFileInfo | null>
