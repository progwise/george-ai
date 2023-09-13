import { typesenseClient } from './typesense.js'
import { summaryCollectionSchema } from './upsert-webpagesummary.js'

export const ensureCollectionExists = async () => {
  const collectionExists = await typesenseClient
    .collections(summaryCollectionSchema.name)
    .exists()

  if (!collectionExists) {
    await typesenseClient.collections().create(summaryCollectionSchema)
    console.log(`Collection ${summaryCollectionSchema.name} created`)
  }
}
