import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const getEntryPoints = async () => {
  const data = await strapiClient.request(
    graphql(`
      query GetEntryPoints {
        entryPoints {
          data {
            id
            attributes {
              startUrl
              depth
              prompts {
                id
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
    `),
    {},
  )

  const entryPoints = data.entryPoints?.data

  return (
    entryPoints?.map((entry) => ({
      entryPointId: entry.id!,
      startUrl: entry.attributes?.startUrl!,
      depth: entry.attributes?.depth ?? 0,
      prompts:
        entry.attributes?.prompts?.map((prompt) => {
          return {
            id: prompt?.id!,
            promptForSummary: prompt?.promptForKeywords,
            promptForKeywords: prompt?.promptForKeywords,
            largeLanguageModel: prompt?.largeLanguageModel ?? 'unspecified',
            isDefaultPrompt: prompt?.isDefaultPrompt,
            language: prompt?.language ?? 'en',
          }
        }) ?? [],
    })) ?? []
  )
}
