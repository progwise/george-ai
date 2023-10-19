import { graphql } from '../gql/gql'
import { strapiClient } from '../strapi-client'

export const GetAllSummaries = async () => {
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
}
