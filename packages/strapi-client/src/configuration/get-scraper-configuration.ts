import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const getScraperConfiguration = async () => {
  try {
    const { scraperConfiguration: scraperConfigurationResponse } =
      await strapiClient.request(
        graphql(`
          query GetScraperConfiguration {
            scraperConfiguration {
              data {
                attributes {
                  entryPoints {
                    startUrl
                    depth
                    prompts {
                      data {
                        id
                      }
                    }
                  }
                }
              }
            }
          }
        `),
        {},
      )

    const entryPoints =
      scraperConfigurationResponse?.data?.attributes?.entryPoints

    return (
      entryPoints?.map((entry) => ({
        startUrl: entry?.startUrl!,
        depth: entry?.depth ?? 0,
        prompts:
          entry?.prompts?.data
            .map((prompt) => prompt.id)
            .filter((id): id is string => typeof id === 'string') || [],
      })) ?? []
    )
  } catch (error) {
    console.error('Error fetching ScraperConfiguration:', error)
    throw error
  }
}
