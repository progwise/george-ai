import { graphql } from '../gql/gql'
import { GetWebPageSummariesQuery } from '../gql/graphql'
import { strapiClient } from '../strapi'

export const GetAllWebPageSummaries = async () => {
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
    return webPageSummaries?.data
  } catch (error) {
    console.error('An error occurred while fetching webPages summary:', error)
    throw error
  }
}
