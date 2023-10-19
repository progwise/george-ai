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

    return (
      scrapedWebPages?.data.map(({ id, attributes }) => {
        return {
          id: id ?? '',
          originalContent: attributes?.originalContent ?? '',
          url: attributes?.url ?? '',
          prompts:
            attributes?.prompts?.data.map(({ attributes }) => {
              return {
                summaryPrompt: attributes?.summaryPrompt,
                keywordPrompt: attributes?.keywordPrompt,
                llm: attributes?.llm ?? 'unspecified',
                locale: attributes?.locale ?? 'en',
              }
            }) ?? [],
        }
      }) ?? []
    )
  } catch (error) {
    console.error('Error while fetching ScrapedWebPages:', error)
    throw error
  }
}
