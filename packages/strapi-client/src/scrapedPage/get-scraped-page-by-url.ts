import { graphql } from '../gql/gql'
import { strapiClient } from '../strapi-client'

export const getScrapedPageByUrl = async (url: string) => {
  const { scrapedWebPages } = await strapiClient.request(
    graphql(`
      query GetScrapedWebPagesByUrl($url: String!) {
        scrapedWebPages(filters: { url: { eq: $url } }) {
          data {
            id
            attributes {
              originalContent
              entry_point {
                data {
                  id
                }
              }
            }
          }
        }
      }
    `),
    { url },
  )

  return {
    id: scrapedWebPages?.data.at(0)?.id ?? '',
    originalContent:
      scrapedWebPages?.data.at(0)?.attributes?.originalContent ?? '',
    scrapedPageEntryPointId:
      scrapedWebPages?.data.at(0)?.attributes?.entry_point?.data?.id,
  }
}
