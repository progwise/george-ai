import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'
import { typesenseClient } from '../typesense.js'

export enum PublicationState {
  Draft = 'draft',
  Published = 'published',
}

export type WebPagesDocument = {
  id: string
  title: string
  url: string
  language: string
  originalContent: string
  publicationState: PublicationState
  keywords: string[]
  summary: string
  largeLanguageModel: string
}

export const searchSummaryDocuments = async (
  query: string,
  filters: string,
) => {
  const response = await typesenseClient
    .collections<WebPagesDocument>(summaryCollectionSchema.name)
    .documents()
    .search({
      q: query,
      query_by: ['title', 'keywords', 'summary', 'url', 'originalContent'],
      filter_by: filters,
      sort_by: 'popularity:desc,_text_match:desc',
    })

  return response.hits?.map((hit) => hit.document) ?? []
}
