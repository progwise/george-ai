import { typesenseClient } from './typesense.js'

export const deleteCollection = async (collectionName: string) => {
  try {
    await typesenseClient.collections(collectionName).delete()
    console.log(`Collection ${collectionName} successfully deleted.`)
  } catch (error) {
    console.error(`Failed to delete collection ${collectionName}:`, error)
  }
}
