import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const updateScrapedPage = async (
  id: string,
  originalContent: string,
) => {
  try {
    const { updateScrapedWebPage } = await strapiClient.request(
      graphql(`
        mutation UpdateScrapedWebPage($id: ID!, $data: ScrapedWebPageInput!) {
          updateScrapedWebPage(id: $id, data: $data) {
            data {
              id
            }
          }
        }
      `),
      {
        id,
        data: {
          originalContent,
        },
      },
    )

    console.log('Update ScrapedWebPage with ID:', id)
  } catch (error) {
    console.error('Error while updating ScrapedWebPage:', error)
    throw error
  }
}
