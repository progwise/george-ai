import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const createPrompts = async (
  locale: string,
  summary: string[],
  keywords: string[],
) => {
  try {
    const { createPrompt } = await strapiClient.request(
      graphql(`
        mutation CreatePrompt(
          $locale: I18NLocaleCode!
          $summaryPrompt: String!
          $keywordPrompt: String!
          $llm: String!
        ) {
          createPrompt(
            locale: $locale
            data: {
              summaryPrompt: $summaryPrompt
              keywordPrompt: $keywordPrompt
              llm: $llm
              isDefaultPrompt: true
            }
          ) {
            data {
              id
            }
          }
        }
      `),
      {
        locale,
        summaryPrompt: JSON.stringify(summary),
        keywordPrompt: JSON.stringify(keywords),
        llm: 'gpt-3.5-turbo',
      },
    )
    console.log(`Prompt for ${locale} created by id:`, createPrompt?.data?.id)
  } catch (error) {
    console.error('Error while creating Prompt:', error)
    throw error
  }
}
