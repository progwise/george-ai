import { NewSummary } from './update-summary'
import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

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
      'Created WebPageSummary with ID:',
      createWebPageSummary?.data?.id,
    )
  } catch (error) {
    console.error('Error while creating WebPageSummary:', error)
    throw error
  }
}
