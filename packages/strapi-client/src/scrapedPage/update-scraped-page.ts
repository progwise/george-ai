import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const updateScrapedPage = async (
  id: string,
  title: string,
  originalContent: string,
  entryPointId: string,
) => {
  await strapiClient.request(
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
        title,
        originalContent,
        entry_point: entryPointId,
      },
    },
  )

  console.log('Update ScrapedWebPage with id:', id)
}
