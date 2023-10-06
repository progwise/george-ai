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

export const searchWebPageDocuments = async (
  query: string,
  filters: string[],
): Promise<WebPagesDocument[] | undefined> => {
  try {
    const response = await typesenseClient
      .collections<WebPagesDocument>(summaryCollectionSchema.name)
      .documents()
      .search({
        q: query,
        query_by: ['title', 'keywords', 'summary', 'url', 'originalContent'],
        filter_by: filters.join(' && '),
        sort_by: 'popularity:desc,_text_match:desc',
      })

    console.log('esponse.hits:', response.hits?.map((hit) => hit.document))
    return response.hits?.map((hit) => hit.document)
  } catch (error) {
    console.error(
      `An error occurred while fetching ${summaryCollectionSchema.name}:`,
      error,
    )
    throw error
  }
}
