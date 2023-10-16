import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'
import { typesenseClient } from '../typesense.js'

export const deleteSummaryDocument = async (id: string) => {
  try {
    await typesenseClient
      .collections(summaryCollectionSchema.name)
      .documents(id)
      .delete()

    console.log(`Document ${id} successfully deleted.`)
  } catch (error) {
    console.error(`Failed to delete document ${id}`, error)
    throw error
  }
}
