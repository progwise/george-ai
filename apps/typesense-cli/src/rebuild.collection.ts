import { GraphQLClient } from 'graphql-request'
import dotenv from 'dotenv'
import { graphql } from './gql'
import { upsertTypesenseCollection } from '@george-ai/typesense-client'
import pMap from 'p-map'
import { WebPageSummaryEntity } from './gql/graphql'

dotenv.config()

const endpoint = 'http://localhost:1337/graphql'
const strapiClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
  },
})

const GET_ALL_WEBPAGES_SUMMARIES_QUERY = graphql(`
  query GetWebPageSummaries {
    webPageSummaries(publicationState: PREVIEW, locale: "all") {
      data {
        id
        attributes {
          keywords
          summary
          largeLanguageModel
          scraped_web_pages {
            data {
              attributes {
                title
                url
                originalContent
                locale
                publishedAt
              }
            }
          }
        }
      }
    }
  }
`)

export const rebuildCollection = async () => {
  try {
    const { webPageSummaries } = await strapiClient.request(
      GET_ALL_WEBPAGES_SUMMARIES_QUERY,
      {},
    )

    const webPageSummaryArray = webPageSummaries?.data || []

    const mapper = async (webPageSummary: WebPageSummaryEntity) => {
      await upsertTypesenseCollection(webPageSummary)
    }

    await pMap(webPageSummaryArray, mapper, { concurrency: 10 })
  } catch (error) {
    console.error(error)
  }
}

rebuildCollection()
