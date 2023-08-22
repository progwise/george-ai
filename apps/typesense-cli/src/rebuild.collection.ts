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
          OriginalContent
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
    { name: 'title', type: 'string' },
    { name: 'url', type: 'string' },
    { name: 'language', type: 'string' },
    { name: 'originalContent', type: 'string' },
    { name: 'publicationState', type: 'string' },
    { name: 'keywords', type: 'string' },
    { name: 'summary', type: 'string' },
    { name: 'largeLanguageModel', type: 'string' },
  ],
}

export const rebuildTypesenseCollection = async () => {
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

    const documents =
      scrapedWebPages?.data.flatMap((page) =>
        (page.attributes?.WebPageSummaries || []).map((summary) => ({
          title: page.attributes?.Title,
          url: page.attributes?.Url,
          language: page.attributes?.locale,
          originalContent: page.attributes?.OriginalContent,
          publicationState: page.attributes?.publishedAt
            ? 'published'
            : 'draft',
          keywords: summary?.GeneratedKeywords,
          summary: summary?.GeneratedSummary,
          largeLanguageModel: summary?.LargeLanguageModel,
        })),
      ) || []

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

rebuildTypesenseCollection()
