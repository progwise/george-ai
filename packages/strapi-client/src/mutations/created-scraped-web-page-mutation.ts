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

    console.log(
      'Created ScrapedWebPage with ID:',
      createScrapedWebPage?.data?.id,
    )

    return createScrapedWebPage?.data
  } catch (error) {
    console.error('Error while creating ScrapedWebPage:', error)
    throw error
  }
}
