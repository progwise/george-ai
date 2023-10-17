import { isSummaryCollectionPopulated } from '../collections/is-summary-collection-populated .js'
import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'
import { typesenseClient } from '../typesense.js'

export const deleteSummaryDocument = async (id: string) => {
  try {
    if (!(await isSummaryCollectionPopulated())) {
      console.log('no collection documents')
      return
    }
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
