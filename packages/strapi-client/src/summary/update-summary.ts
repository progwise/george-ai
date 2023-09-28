import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export interface NewSummary {
  summary: string
  keywords: string
  largeLanguageModel: string
  scraped_web_page: string
}

export const updateSummary = async (
  newSummary: NewSummary,
  webPageSummaryId: string,
) => {
  try {
    const { updateWebPageSummary } = await strapiClient.request(
      graphql(`
        mutation UpdateWebPageSummary($id: ID!, $data: WebPageSummaryInput!) {
          updateWebPageSummary(id: $id, data: $data) {
            data {
              id
              attributes {
                locale
                keywords
                summary
                largeLanguageModel
                scraped_web_page {
                  data {
                    id
                  }
                }
              }
            }
          }
        }
      `),
      {
        id: webPageSummaryId,
        data: newSummary,
      },
    )

    console.log(
      `Update WebPageSummary for ${updateWebPageSummary?.data?.attributes?.locale} with ID:`,
      webPageSummaryId,
    )
  } catch (error) {
    console.error('Error while updating WebPageSummary:', error)
    throw error
  }
}
