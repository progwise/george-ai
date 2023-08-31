import { Client } from 'typesense'
import { FieldType } from 'typesense/lib/Typesense/Collection.js'

export const typesenseClient = new Client({
  nodes: [
    {
      host: process.env.TYPESENSE_API_HOST ?? '',
      port: Number.parseInt(process.env.TYPESENSE_API_PORT ?? '0'),
      protocol: process.env.TYPESENSE_API_PROTOCOL ?? '',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY ?? '',
})

const baseCollectionSchema: {
  name: string
  fields: {
    name: string
    type: FieldType
    optional?: boolean
  }[]
} = {
  name: '',
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

const COLLECTION_NAME = 'scraped_web_pages_summaries'

export const ensureCollectionExists = async () => {
  const collectionExists = await typesenseClient
    .collections(COLLECTION_NAME)
    .exists()
  console.log('collectionExists:', collectionExists)
  if (!collectionExists) {
    const collectionSchema = {
      ...baseCollectionSchema,
      name: COLLECTION_NAME,
    }
    await typesenseClient.collections().create(collectionSchema)
    console.log(`Collection ${COLLECTION_NAME} created`)
  }
}

interface Document {
  id: string
  title: string
  url: string
  language: string
  originalContent: string
  publicationState: string
  keywords: any
  summary: string
  largeLanguageModel: string
}

export const upsertDocument = async (document: Document) => {
  await typesenseClient
    .collections(COLLECTION_NAME)
    .documents()
    .upsert(document)
  console.log(
    `Data upsert to typesense in collection ${COLLECTION_NAME} by id: ${document.id}`,
  )
}
