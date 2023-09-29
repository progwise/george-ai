import { summaryCollectionSchema } from '../collections/summary-collection-schema.js'
import { typesenseClient } from '../typesense.js'

const isHttpError = (error: any): error is { httpStatus: number } => {
  return error && typeof error.httpStatus === 'number'
}

export const deleteDocument = async (id: string) => {
  try {
    const document = await typesenseClient
      .collections(summaryCollectionSchema.name)
      .documents(id)
      .retrieve()

    if (!document) {
      console.log(`Document ${id} does not exist. Skipping deletion.`)
      return
    }

    await typesenseClient
      .collections(summaryCollectionSchema.name)
      .documents(id)
      .delete()

    console.log(`Document ${id} successfully deleted.`)
  } catch (error) {
    if (isHttpError(error) && error.httpStatus === 404) {
      console.log(`Document ${id} does not exist. Skipping deletion.`)
      return
    }
    console.error(`Failed to delete document ${id}`, error)
    throw error
  }
}
