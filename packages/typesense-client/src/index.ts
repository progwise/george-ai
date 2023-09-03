import { typesenseClient } from './typesense.js'
import { FieldType } from 'typesense/lib/Typesense/Collection.js'

interface WebPageSummary {
  id: string
  language: string
  keywords: string
  summary: string
  largeLanguageModel: string
  title: string
  url: string
  originalContent: string
  publicationState: string
}

const baseCollectionSchema: {
  name: string
  fields: {
    name: string
    type: FieldType
    optional?: boolean
  }[]
} = {
  name: 'summaryCollectionSchema',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'url', type: 'string' },
    { name: 'language', type: 'string' },
    { name: 'originalContent', type: 'string' },
    { name: 'publicationState', type: 'string' },
    { name: 'keywords', type: 'string[]' },
    { name: 'summary', type: 'string' },
    { name: 'largeLanguageModel', type: 'string' },
  ],
}

export const upsertTypesenseCollection = async (
  webPageSummary: WebPageSummary,
) => {
  try {
    const collectionExists = await typesenseClient
      .collections(baseCollectionSchema.name)
      .exists()

    if (!collectionExists) {
      await typesenseClient.collections().create(baseCollectionSchema)
      console.log(`Collection ${baseCollectionSchema.name} created`)
    }

    await typesenseClient
      .collections(baseCollectionSchema.name)
      .documents()
      .upsert(webPageSummary)
    console.log(
      `Data upsert to typesense in collection ${baseCollectionSchema.name} by id: ${webPageSummary.id}`,
    )
  } catch (error) {
    console.error(error)
  }
}
