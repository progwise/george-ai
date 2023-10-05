import { graphql } from '../gql/gql'
import { strapiClient } from '../strapi-client'

export const getAllScrapedPages = async () => {
  try {
    const { scrapedWebPages } = await strapiClient.request(
      graphql(`
        query GetAllScrapedWebPages {
          scrapedWebPages(publicationState: PREVIEW, locale: "all") {
            data {
              id
              attributes {
                originalContent
                url
              }
            }
          }
        }
      `),
      {},
    )

    return scrapedWebPages?.data
  } catch (error) {
    console.error('Error while fetching ScrapedWebPages:', error)
    throw error
  }
}
