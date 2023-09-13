import { GraphQLClient } from 'graphql-request'
import dotenv from 'dotenv'
import { graphql } from './gql'
import {
  ensureCollectionExists,
  upsertWebpageSummary,
} from '@george-ai/typesense-client'
import pMap from 'p-map'
import { WebPageSummaryEntity } from './gql/graphql'

dotenv.config()

const endpoint = 'http://localhost:1337/graphql'
const strapiClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
  },
})

export const rebuildCollection = async () => {
  try {
    const { webPageSummaries } = await strapiClient.request(
      graphql(`
        query GetWebPageSummaries {
          webPageSummaries(publicationState: PREVIEW, locale: "all") {
            data {
              id
              attributes {
                locale
                keywords
                summary
                largeLanguageModel
                publishedAt
                scraped_web_page {
                  data {
                    attributes {
                      title
                      url
                      originalContent
                    }
                  }
                }
              }
            }
          }
        }
      `),
      {},
    )

    const webPageSummaryArray = webPageSummaries?.data || []

    const mapper = async (webPageSummaryEntity: WebPageSummaryEntity) => {
      const webPageSummary = {
        id: webPageSummaryEntity.id ?? '',
        language: webPageSummaryEntity.attributes?.locale ?? '',
        keywords: webPageSummaryEntity.attributes?.keywords
          ? JSON.parse(webPageSummaryEntity.attributes?.keywords)
          : [],
        summary: webPageSummaryEntity.attributes?.summary ?? '',
        largeLanguageModel:
          webPageSummaryEntity.attributes?.largeLanguageModel ?? '',
        title:
          webPageSummaryEntity.attributes?.scraped_web_page?.data?.attributes
            ?.title ?? '',
        url:
          webPageSummaryEntity.attributes?.scraped_web_page?.data?.attributes
            ?.url ?? '',
        originalContent:
          webPageSummaryEntity.attributes?.scraped_web_page?.data?.attributes
            ?.originalContent ?? '',
        publicationState: webPageSummaryEntity.attributes?.publishedAt
          ? 'published'
          : 'draft',
      }
      await upsertWebpageSummary(webPageSummary)
    }
    await ensureCollectionExists()
    await pMap(webPageSummaryArray, mapper, { concurrency: 10 })
  } catch (error) {
    console.error(error)
  }
}

rebuildCollection()
