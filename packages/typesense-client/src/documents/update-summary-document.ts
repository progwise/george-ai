import { isSummaryCollectionPopulated } from '../collections/is-summary-collection-populated .js'
import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'
import { typesenseClient } from '../typesense.js'

type UpdateDocument = {
  popularity: number
}

export const updateSummaryDocument = async (
  document: UpdateDocument,
  id: string,
) => {
  try {
    if (!(await isSummaryCollectionPopulated())) {
      console.log('no collection documents')
      return
    }
    await typesenseClient
      .collections<UpdateDocument>(summaryCollectionSchema.name)
      .documents(id)
      .update(document)

    console.log(`Document ${id} successfully update.`)
  } catch (error) {
    console.error(`Failed to delete document ${id}`, error)
    throw error
  }
}
