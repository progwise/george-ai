import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export interface NewSummary {
  summary: string
  keywords: string
  largeLanguageModel: string
  scraped_web_page: string
}

export const createSummary = async (newSummary: NewSummary, locale: string) => {
  try {
    const { createWebPageSummary } = await strapiClient.request(
      graphql(`
        mutation CreateWebPageSummary(
          $data: WebPageSummaryInput!
          $locale: I18NLocaleCode!
        ) {
          createWebPageSummary(data: $data, locale: $locale) {
            data {
              id
              attributes {
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
        data: newSummary,
        locale,
      },
    )

    console.log(
      `Created WebPageSummary for ${locale} with ID:`,
      createWebPageSummary?.data?.id,
    )
  } catch (error) {
    console.error('Error while creating WebPageSummary:', error)
    throw error
  }
}
