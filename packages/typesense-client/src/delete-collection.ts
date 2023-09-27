import { typesenseClient } from './typesense.js'
import { summaryCollectionSchema } from './upsert-webpagesummary.js'

export const deleteCollection = async () => {
  try {
    await typesenseClient.collections(summaryCollectionSchema.name).delete()
    console.log(
      `Collection ${summaryCollectionSchema.name} successfully deleted.`,
    )
  } catch (error) {
    console.error(
      `Error while deleting collection ${summaryCollectionSchema.name}:`,
      error,
    )
    throw error
  }
}
