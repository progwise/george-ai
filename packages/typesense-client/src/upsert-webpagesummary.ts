import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections.js'
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
}

export const summaryCollectionSchema: CollectionCreateSchema = {
  name: 'scraped_web_pages_summaries',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'url', type: 'string' },
    { name: 'language', type: 'string' },
    { name: 'originalContent', type: 'string' },
    { name: 'publicationState', type: 'string' },
    { name: 'keywords', type: 'string[]' },
    { name: 'summary', type: 'string' },
    { name: 'largeLanguageModel', type: 'string' },
  ],
}

export const upsertWebpageSummary = async (WebPageSummary: WebPageSummary) => {
  await upsertDocument(summaryCollectionSchema, WebPageSummary)
}
