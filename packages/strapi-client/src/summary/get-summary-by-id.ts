import { graphql } from '../gql/gql'
import { strapiClient } from '../strapi-client'

export const getSummariesById = async (id: string) => {
  try {
    const { webPageSummary } = await strapiClient.request(
      graphql(`
        query WebPageSummary($id: ID!) {
          webPageSummary(id: $id) {
            data {
              id
              attributes {
                lastScrapeUpdate
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
      { id },
    )
    return webPageSummary?.data
  } catch (error) {
    console.error('Error while fetching WebPagesSummaries:', error)
    throw error
  }
}
