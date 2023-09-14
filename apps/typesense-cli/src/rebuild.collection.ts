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
      const summaryFeedbacks = (
        webPageSummaryEntity.attributes?.summary_feedbacks?.data ?? []
      ).filter((feedback) => {
        const createdAt = new Date(feedback.attributes?.createdAt)
        return createdAt > updatedAt
      })

      // eslint-disable-next-line unicorn/no-array-reduce
      const popularity = summaryFeedbacks.reduce((accumulator, feedback) => {
        const vote = feedback.attributes?.voting
        if (vote === 'up') {
          return accumulator + 1
        }
        if (vote === 'down') {
          return accumulator - 1
        }
        return accumulator
      }, 0)

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
      await upsertTypesenseCollection(webPageSummary)
    }

    await pMap(webPageSummaryArray, mapper, { concurrency: 10 })
  } catch (error) {
    console.error(error)
  }
}

rebuildCollection()
