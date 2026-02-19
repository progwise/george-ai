export interface CrawledFileInfo {
  id?: string
  mimeType?: string
  hints?: string | null
  errorMessage?: string | null
  originUri?: string | null
  name?: string | null
  skipProcessing?: boolean
  wasUpdated?: boolean
  downloadUrl?: string
}
