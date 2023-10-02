import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections.js'
import { typesenseClient } from '../typesense.js'

export const upsertDocument = async (
  schema: CollectionCreateSchema,
  document: object,
  id: string,
) => {
  try {
    await typesenseClient.collections(schema.name).documents().upsert(document)
    console.log(`Data upsert to typesense collection with id: ${id}`)
  } catch (error) {
    console.error(
      `Error while Upsert collection ${schema.name} with id: ${id}`,
      error,
    )
    throw error
  }
}
