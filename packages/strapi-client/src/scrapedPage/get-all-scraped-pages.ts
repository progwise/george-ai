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
        const pageId = id ?? ''
        const originalContent = attributes?.originalContent ?? ''
        const url = attributes?.url ?? ''
        const promptsData = attributes?.prompts?.data
        const prompts = promptsData
          ? promptsData.map(({ attributes }) => {
              return {
                summaryPrompt: attributes?.summaryPrompt,
                keywordPrompt: attributes?.keywordPrompt,
                llm: attributes?.llm ?? 'unspecified',
                locale: attributes?.locale ?? 'en',
              }
            })
          : []

        return {
          id: pageId,
          originalContent,
          url,
          prompts,
        }
      }) ?? []
    )
  } catch (error) {
    console.error('Error while fetching ScrapedWebPages:', error)
    throw error
  }
}
