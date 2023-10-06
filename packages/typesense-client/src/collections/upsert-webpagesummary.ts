import { summaryCollectionSchema } from './summary-collection-schema.js'
import { upsertDocument } from '../documents/upsert-document.js'
import { PublicationState } from '../index.js'

interface WebPageSummary {
  id: string
  language: string
  keywords: string[]
  summary: string
  largeLanguageModel: string
  title: string
  url: string
  originalContent: string
  publicationState: PublicationState
  popularity: number
}

export const upsertWebpageSummary = async (WebPageSummary: WebPageSummary) => {
  await upsertDocument(
    summaryCollectionSchema,
    WebPageSummary,
    WebPageSummary.id,
  )
}
