import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'
import { NewSummary } from './create-summary'

export const updateSummary = async (
  updatedSummary: NewSummary,
  summaryId: string,
) => {
  const { updateWebPageSummary } = await strapiClient.request(
    graphql(`
      mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {
        updateWebPageSummary(id: $id, data: $data) {
          data {
            id
            attributes {
              locale
              summary
              keywords
              largeLanguageModel
              scraped_web_page {
                data {
                  id
                }
              }
              lastScrapeUpdate
              prompt {
                id
                promptForSummary
                promptForKeywords
                largeLanguageModel
                isDefaultPrompt
                language
              }
            }
          }
        }
      }
    `),
    {
      id: summaryId,
      data: updatedSummary,
    },
  )

  console.log(
    `Update WebPageSummary for ${updateWebPageSummary?.data?.attributes?.locale} with id:`,
    summaryId,
  )
}
