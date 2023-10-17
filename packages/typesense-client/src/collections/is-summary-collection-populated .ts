import { typesenseClient } from '../typesense.js'
import { summaryCollectionSchema } from './summary-collection-schema.js'

export const isSummaryCollectionPopulated = async () => {
  try {
    const collections = await typesenseClient
      .collections(summaryCollectionSchema.name)
      .documents()
      .search({
        q: '*',
        query_by: '',
      })

    if (!collections.hits || collections.hits?.length === 0) {
      console.log(
        'the collection does not contain documents, please rebuild the collection before further processing ',
      )
      return false
    }

    return true
  } catch (error) {
    console.error(
      'An error occurred while checking if the collection is not empty:',
      error,
    )
    throw error
  }
}
