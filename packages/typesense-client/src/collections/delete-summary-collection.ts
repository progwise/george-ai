import { summaryCollectionSchema } from './summary-collection-schema.js'
import { typesenseClient } from '../typesense.js'

export const deleteSummaryCollection = async () => {
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
