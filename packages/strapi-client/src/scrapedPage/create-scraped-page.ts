import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const createScrapedPage = async (
  title: string,
  originalContent: string,
  url: string,
  prompts: string[],
) => {
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

  console.log('Created ScrapedWebPage with id:', createScrapedWebPage?.data?.id)
}
