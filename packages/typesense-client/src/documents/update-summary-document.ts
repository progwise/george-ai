import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'
import { typesenseClient } from '../typesense.js'

export const updateSummaryDocument = async (document: object, id: string) => {
  try {
    await typesenseClient
      .collections(summaryCollectionSchema.name)
      .documents(id)
      .update(document)

    console.log(`Document ${id} successfully update.`)
  } catch (error) {
    console.error(`Failed to delete document ${id}`, error)
    throw error
  }
}
