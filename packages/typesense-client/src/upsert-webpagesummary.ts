import { summaryCollectionSchema } from './summary-collection-schema.js'
import { upsertDocument } from './upsert-document.js'

interface WebPageSummary {
  id: string
  language: string
  keywords: string
  summary: string
  largeLanguageModel: string
  title: string
  url: string
  originalContent: string
  publicationState: string
  popularity: number
}

export const upsertWebpageSummary = async (WebPageSummary: WebPageSummary) => {
  await upsertDocument(summaryCollectionSchema, WebPageSummary)
}
