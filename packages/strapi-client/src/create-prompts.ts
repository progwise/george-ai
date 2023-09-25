import { graphql } from '../../../apps/playwright-scraper/src/gql/gql'
import { strapiPrompts } from './prompts'
// import { strapiClient } from '../../../apps/playwright-scraper/src/strapi-client'

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
    console.error('An error occurred:', error)
  }
}
