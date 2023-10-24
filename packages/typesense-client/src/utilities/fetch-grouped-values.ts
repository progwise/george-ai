import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'
import { typesenseClient } from '../typesense.js'

export const fetchGroupedValues = async (
  fieldName: string,
): Promise<string[]> => {
  const response = await typesenseClient
    .collections(summaryCollectionSchema.name)
    .documents()
    .search({
      q: '*',
      query_by: '',
      group_by: fieldName,
    })
  return response.grouped_hits?.map((item) => item.group_key).flat() || []
}
