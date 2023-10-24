import { summaryCollectionSchema } from './summary-collection-schema.js'
import { typesenseClient } from '../typesense.js'

export const deleteSummaryCollection = async () => {
  await typesenseClient.collections(summaryCollectionSchema.name).delete()
  console.log(
    `Collection ${summaryCollectionSchema.name} successfully deleted.`,
  )
}
