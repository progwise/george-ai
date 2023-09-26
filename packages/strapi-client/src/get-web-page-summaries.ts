import { graphql } from './gql/gql.js'
import { GetWebPageSummariesQuery } from './gql/graphql.js'
import { strapiClient } from './strapi.js'

export const GetWebPageSummaries = async () => {
  const { webPageSummaries } =
    await strapiClient.request<GetWebPageSummariesQuery>(
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
}
