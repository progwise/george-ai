import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'
import { typesenseClient } from '../typesense.js'
import { SummaryDocument } from './upsert-summary-document.js'

export const updateSummaryDocument = async (
  document: Partial<SummaryDocument>,
  id: string,
) => {
  await typesenseClient
    .collections(summaryCollectionSchema.name)
    .documents(id)
    .update(document)

  console.log(`Document ${id} successfully update.`)
}
