import { strapiClient } from '..'
import { graphql } from '../gql'

export const createdScrapedWebPage = async (
  title: string,
  originalContent: string,
  url: string,
  locale: string,
) => {
  try {
    const { createScrapedWebPage } = await strapiClient.request(
      graphql(`
        mutation CreateScrapedWebPage(
          $data: ScrapedWebPageInput!
          $locale: I18NLocaleCode!
        ) {
          createScrapedWebPage(data: $data, locale: $locale) {
            data {
              id
              attributes {
                title
                url
                originalContent
              }
            }
          }
        }
      `),
      {
        data: {
          title,
          originalContent,
          url,
        },
        locale,
      },
    )
    return createScrapedWebPage?.data
  } catch (error) {
    console.error('Error creating ScrapedWebPage:', error)
    throw error
  }
}
