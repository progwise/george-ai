import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'
import { strapiPrompts } from './prompts'

export const createPrompts = async () => {
  try {
    const { prompts } = await strapiClient.request(
      graphql(`
        query GetPrompts {
          prompts(locale: "all") {
            data {
              id
            }
          }
        }
      `),
      {},
    )

    if (prompts?.data && prompts.data.length > 0) {
      console.log('Prompts already exist')
      return
    }

    for (const [locale, promptData] of Object.entries(strapiPrompts)) {
      const { summary, keywords } = promptData

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
          summaryPrompt: summary.join(' '),
          keywordPrompt: keywords.join(' '),
          llm: 'gpt-3.5-turbo',
        },
      )
      console.log(`Prompt for ${locale} created by id:`, createPrompt?.data?.id)
    }
  } catch (error) {
    console.error('Error while creating Prompts:', error)
    throw error
  }
}
