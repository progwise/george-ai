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
  try {
    await typesenseClient
      .collections(summaryCollectionSchema.name)
      .documents()
      .upsert(document)
    console.log(`Data upsert to typesense collection with id: ${document.id}`)
  } catch (error) {
    console.error(
      `Error while Upsert collection with id: ${document.id}`,
      error,
    )
    throw error
  }
}
