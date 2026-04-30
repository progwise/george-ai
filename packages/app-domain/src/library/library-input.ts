export interface LibraryInput {
  name?: string | null
  description?: string | null
  url?: string | null
  embeddingModelId?: string | null
  ocrModelId?: string | null
  fileConverterOptions?: string | null
  embeddingTimeoutMs?: number | null
  autoProcessCrawledFiles?: boolean | null
}
