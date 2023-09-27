import { summaryCollectionSchema } from './summary-collection-schema.js'
import { typesenseClient } from './typesense.js'

export const fetchSearchWebPages = async (query: string, filters: string[]) => {
  try {
    const response = await typesenseClient
      .collections(summaryCollectionSchema.name)
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
