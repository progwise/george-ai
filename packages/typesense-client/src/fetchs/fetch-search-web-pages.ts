import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'
import { typesenseClient } from '../typesense.js'

export enum PublicationState {
  Draft = 'draft',
  Published = 'published',
}

export type SearchWebPages = {
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

export const fetchSearchWebPages = async (
  query: string,
  filters: string[],
): Promise<SearchWebPages[] | undefined> => {
  try {
    const response = await typesenseClient
      .collections<SearchWebPages>(summaryCollectionSchema.name)
      .documents()
      .search({
        q: query,
        query_by: ['title', 'keywords', 'summary', 'url', 'originalContent'],
        filter_by: filters.join(' && '),
        sort_by: 'popularity:desc,_text_match:desc',
      })

    return response.hits?.map((hit) => hit.document)
  } catch (error) {
    console.error(
      `An error occurred while fetching ${summaryCollectionSchema.name}:`,
      error,
    )
    throw error
  }
}
