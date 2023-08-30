import { GraphQLClient } from 'graphql-request'
import dotenv from 'dotenv'
import { graphql } from './gql'
import { rebuildTypesenseCollection } from '@george-ai/typesense-client'

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
          Keywords
          Summary
          LargeLanguageModel

          scraped_web_pages {
            data {
              attributes {
                Title
                Url
                OriginalContent
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
    rebuildTypesenseCollection(webPageSummaries)
  } catch (error) {
    console.error(error)
  }
}

rebuildCollection()
