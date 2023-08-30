import { GraphQLClient } from 'graphql-request'
import dotenv from 'dotenv'
import { FieldType } from 'typesense/lib/Typesense/Collection.js'
import { client } from './typesense.js'

dotenv.config()

const baseCollectionSchema: {
  name: string
  fields: {
    name: string
    type: FieldType
    optional?: boolean
  }[]
} = {
  name: 'scraped_web_pages',
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

// TODO: any
export const rebuildTypesenseCollection = async (webPageSummary: any) => {
  try {
    const collectionName = 'scraped_web_pages_summaries'
    const collectionExists = await client.collections(collectionName).exists()
    const collectionSchema = {
      ...baseCollectionSchema,
      name: collectionName,
    }
    if (!collectionExists) {
      await client.collections().create(collectionSchema)
      console.log(`Collection ${collectionName} created`)
    }

    const documents =
      // TODO: any
      webPageSummary?.data.map((summary: any) => ({
        id: summary?.id,
        title: summary.Title,
        url: summary.Url,
        language: summary.locale,
        originalContent: summary.OriginalContent,
        publicationState: summary.publishedAt ? 'published' : 'draft',
        keywords: summary?.GeneratedKeywords
          ? JSON.parse(summary.GeneratedKeywords)
          : [],
        summary: summary?.GeneratedSummary,
        largeLanguageModel: summary?.LargeLanguageModel,
      })) || []

    for (const document of documents) {
      await client.collections(collectionName).documents().upsert(document)
      console.log(
        `Data added to typesense in collection ${collectionName}`,
        document,
      )
    }
  } catch (error) {
    console.error(error)
  }
}

// rebuildTypesenseCollection()
