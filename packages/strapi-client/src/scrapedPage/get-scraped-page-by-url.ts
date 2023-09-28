import { graphql } from '../gql/gql'
import { strapiClient } from '../strapi-client'

export const getScrapedPageByUrl = async (url: string) => {
  try {
    const { scrapedWebPages } = await strapiClient.request(
      graphql(`
        query GetScrapedWebPagesByUrl($url: String!) {
          scrapedWebPages(
            publicationState: PREVIEW
            locale: "all"
            filters: { url: { eq: $url } }
          ) {
            data {
              id
            }
          }
        }
      `),
      { url },
    )

    return scrapedWebPages?.data.at(0)
  } catch (error) {
    console.error('Error while fetching ScrapedWebPages:', error)
    throw error
  }
}
