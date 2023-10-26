import { graphql } from '../gql/gql'
import { strapiClient } from '../strapi-client'

export const getAllScrapedPages = async () => {
  const { scrapedWebPages } = await strapiClient.request(
    graphql(`
      query GetAllScrapedWebPages {
        scrapedWebPages {
          data {
            id
            attributes {
              url
              originalContent
              entry_point {
                data {
                  attributes {
                    prompts {
                      promptForSummary
                      promptForKeywords
                      largeLanguageModel
                      isDefaultPrompt
                      language
                    }
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
        scrapedPageId: id!,
        originalContent: attributes?.originalContent ?? '',
        url: attributes?.url ?? '',
        prompts:
          attributes?.entry_point?.data?.attributes?.prompts?.map((prompt) => {
            return {
              promptForSummary: prompt?.promptForSummary,
              promptForKeywords: prompt?.promptForKeywords,
              largeLanguageModel: prompt?.largeLanguageModel ?? 'unspecified',
              isDefaultPrompt: prompt?.isDefaultPrompt,
              language: prompt?.language ?? 'en',
            }
          }) ?? [],
      }
    }) ?? []
  )
}
