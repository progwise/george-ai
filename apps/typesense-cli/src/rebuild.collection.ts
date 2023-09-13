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

    // const { summaryFeedbacks } = await strapiClient.request(
    //   graphql(`
    //     query GetSummaryFeedbacks {
    //       summaryFeedbacks {
    //         data {
    //           id
    //           attributes {
    //             voting
    //             query
    //             feedbackDate
    //             position
    //             web_page_summary {
    //               data {
    //                 id
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   `),
    //   {},
    // )
    // const allSummaryFeedbacks = summaryFeedbacks?.data

    const mapper = async (webPageSummaryEntity: WebPageSummaryEntity) => {
      const { summaryFeedbacks } = await strapiClient.request(
        graphql(`
          query GetSummaryFeedbacks($id: ID!) {
            summaryFeedbacks(
              filters: { web_page_summary: { id: { eq: $id } } }
            ) {
              data {
                id
                attributes {
                  voting
                  query
                  feedbackDate
                  position
                }
              }
            }
          }
        `),
        { id: webPageSummaryEntity.id ?? '' },
      )

      // const currentSummaryFeedbacks = allSummaryFeedbacks?.filter(
      //   (feedback) =>
      //     feedback.attributes?.web_page_summary?.data?.id ===
      //     webPageSummaryEntity.id,
      // )
      console.log('currentSummaryFeedbacks:', summaryFeedbacks?.data)

      let popularity = 0
      if (summaryFeedbacks?.data) {
        for (const feedback of summaryFeedbacks.data) {
          const vote = feedback.attributes?.voting
          if (vote === 'up') {
            popularity += 1
          }
          if (vote === 'down') {
            popularity -= 1
          }
        }
      }

      // const popularity = summaryFeedbacks?.data.reduce(
      //   (accumulator, feedback) => {
      //     const vote = feedback.attributes?.voting
      //     if (vote === 'up') {
      //       return accumulator + 1
      //     }
      //     if (vote === 'down') {
      //       return accumulator - 1
      //     }
      //     return accumulator
      //   },
      //   0,
      // )

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
