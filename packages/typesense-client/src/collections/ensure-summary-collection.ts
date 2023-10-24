import { summaryCollectionSchema } from './summary-collection-schema.js'
import { typesenseClient } from '../typesense.js'

export const ensureSummaryCollection = async () => {
  const collectionExists = await typesenseClient
    .collections(summaryCollectionSchema.name)
    .exists()

  if (!collectionExists) {
    await typesenseClient.collections().create(summaryCollectionSchema)
    console.log(`Collection ${summaryCollectionSchema.name} created`)
  }
}
