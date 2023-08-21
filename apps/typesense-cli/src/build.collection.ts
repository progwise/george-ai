import { GraphQLClient } from 'graphql-request'
import dotenv from 'dotenv'
import { graphql } from './gql'
import { client } from './typesense'
import { FieldType } from 'typesense/lib/Typesense/Collection'

dotenv.config()

const endpoint = 'http://localhost:1337/graphql'
const strapiClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
  },
})

const GET_ALL_SCRAPE_WEBPAGES_QUERY = graphql(`
  query GetAllScrapedWebPages {
    scrapedWebPages(publicationState: PREVIEW, locale: "all") {
      data {
        id
        attributes {
          Title
          Url
          locale
          publishedAt
          WebPageSummaries {
            id
            Feedback
            GeneratedKeywords
            GeneratedSummary
            LargeLanguageModel
          }
        }
      }
    }
  }
`)

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
    { name: 'Title', type: 'string' },
    { name: 'Url', type: 'string' },
    { name: 'locale', type: 'string' },
    { name: 'publishedAt', type: 'string', optional: true },
    { name: 'GeneratedKeywords', type: 'string' },
    { name: 'GeneratedSummary', type: 'string' },
    { name: 'LargeLanguageModel', type: 'string' },
  ],
}

export const getAllScrapedWebPages = async () => {
  try {
    const { scrapedWebPages } = await strapiClient.request(
      GET_ALL_SCRAPE_WEBPAGES_QUERY,
      {},
    )

    const collectionName = 'scraped_web_pages_summaries'

    const collectionExists = await client.collections(collectionName).exists()

    if (collectionExists) {
      await client.collections(collectionName).delete()
    }

    const collectionSchema = {
      ...baseCollectionSchema,
      name: collectionName,
    }

    await client.collections().create(collectionSchema)
    console.log(`Collection ${collectionName} created`)

    for (const page of scrapedWebPages?.data || []) {
      for (const summary of page.attributes?.WebPageSummaries || []) {
        const document = {
          Title: page.attributes?.Title,
          Url: page.attributes?.Url,
          locale: page.attributes?.locale,
          publishedAt: page.attributes?.publishedAt,
          GeneratedKeywords: summary?.GeneratedKeywords,
          GeneratedSummary: summary?.GeneratedKeywords,
          LargeLanguageModel: summary?.LargeLanguageModel,
        }

        await client.collections(collectionName).documents().upsert(document)
        console.log(
          `Data added to typesense in collection ${collectionName}`,
          document,
        )
      }
    }
  } catch (error) {
    console.error(error)
  }
}
