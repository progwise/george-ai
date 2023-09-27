import { summaryCollectionSchema } from './summary-collection-schema.js'
import { typesenseClient } from '../typesense.js'

export const ensureCollectionExists = async () => {
  try {
    const collectionExists = await typesenseClient
      .collections(summaryCollectionSchema.name)
      .exists()

    if (!collectionExists) {
      await typesenseClient.collections().create(summaryCollectionSchema)
      console.log(`Collection ${summaryCollectionSchema.name} created`)
    }
  } catch (error) {
    console.error(
      'An error occurred while ensuring the collection exists:',
      error,
    )
    throw error
  }
}
