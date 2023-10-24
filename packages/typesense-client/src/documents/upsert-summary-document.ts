import { typesenseClient } from '../typesense.js'
import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'
import { PublicationState } from './search-summary-documents.js'

export type SummaryDocument = {
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

export const upsertSummaryDocument = async (document: SummaryDocument) => {
  await typesenseClient
    .collections(summaryCollectionSchema.name)
    .documents()
    .upsert(document)
  console.log(`Document ${document.id} successfully upsert.`)
}
