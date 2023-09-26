import { graphql } from '../gql/gql'
import { GetScrapedWebPagesByUrlQuery } from '../gql/graphql'
import { strapiClient } from '../strapi'

export const getScrapedWebPage = async (url: string) => {
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
    console.error('An error occurred while fetching scraped web pages:', error)
    throw error
  }
}
