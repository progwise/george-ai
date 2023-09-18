import { GraphQLClient } from 'graphql-request'
import dotenv from 'dotenv'
import { graphql } from './gql'
import {
  computeFeedbackPopularity,
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
                updatedAt
                locale
                keywords
                summary
                largeLanguageModel
                publishedAt
                summary_feedbacks {
                  data {
                    attributes {
                      createdAt
                      voting
                    }
                  }
                }
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
      const updatedAt = new Date(webPageSummaryEntity.attributes?.updatedAt)

      const votes = (
        webPageSummaryEntity.attributes?.summary_feedbacks?.data ?? []
      )
        .filter((feedback) => {
          const createdAt = new Date(feedback.attributes?.createdAt)
          return createdAt > updatedAt
        })
        .map((feedback) => feedback.attributes?.voting || '')

      const popularity = computeFeedbackPopularity(votes)

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
        popularity,
      }
      try {
        await upsertWebpageSummary(webPageSummary)
      } catch (error) {
        console.error('Error upserting Webpage Summary:', error)
      }
    }
    await ensureCollectionExists()
    await pMap(webPageSummaryArray, mapper, { concurrency: 10 })
  } catch (error) {
    console.error('Error fetching results from strapi:', error)
  }
}

rebuildCollection()
