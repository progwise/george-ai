import { typesenseClient } from '../typesense.js'
import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'

export const upsertSummaryDocument = async (document: object, id: string) => {
  try {
    await typesenseClient
      .collections(summaryCollectionSchema.name)
      .documents()
      .upsert(document)
    console.log(`Data upsert to typesense collection with id: ${id}`)
  } catch (error) {
    console.error(
      `Error while Upsert collection ${summaryCollectionSchema.name} with id: ${id}`,
      error,
    )
    throw error
  }
}
