import { graphql } from '../gql/gql'
import { strapiClient } from '../strapi-client'

export const getAllScrapedPages = async () => {
  try {
    const { scrapedWebPages } = await strapiClient.request(
      graphql(`
        query GetAllScrapedWebPages {
          scrapedWebPages {
            data {
              id
              attributes {
                originalContent
                url
                prompts {
                  data {
                    attributes {
                      summaryPrompt
                      keywordPrompt
                      llm
                      locale
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
    return scrapedWebPages?.data
  } catch (error) {
    console.error('Error while fetching ScrapedWebPages:', error)
    throw error
  }
}
