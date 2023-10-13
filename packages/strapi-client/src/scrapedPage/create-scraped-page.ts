import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const createScrapedPage = async (
  title: string,
  originalContent: string,
  url: string,
  prompts: string[],
) => {
  try {
    const { createScrapedWebPage } = await strapiClient.request(
      graphql(`
        mutation CreateScrapedWebPage($data: ScrapedWebPageInput!) {
          createScrapedWebPage(data: $data) {
            data {
              id
            }
          }
        }
      `),
      {
        data: {
          title,
          originalContent,
          url,
          prompts,
        },
      },
    )

    console.log(
      'Created ScrapedWebPage with ID:',
      createScrapedWebPage?.data?.id,
    )
  } catch (error) {
    console.error('Error while creating ScrapedWebPage:', error)
    throw error
  }
}
