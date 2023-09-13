import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections.js'
import { typesenseClient } from './typesense.js'

export const upsertDocument = async (
  schema: CollectionCreateSchema,
  document: object,
) => {
  try {
    await typesenseClient.collections(schema.name).documents().upsert(document)
    console.log(`Data upsert to typesense in collection ${schema.name}`)
  } catch (error) {
    console.error(`Upsert failed for collection ${schema.name}`, error)
  }
}
