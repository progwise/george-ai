import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export interface NewSummary {
  summary: string
  keywords: string
  largeLanguageModel: string
  scraped_web_page: string
  lastScrapeUpdate: Date
  prompt: {
    promptForSummary: string | null | undefined
    promptForKeywords: string | null | undefined
    largeLanguageModel: string
    isDefaultPrompt: boolean | undefined
    language: string
  }
}

export const createSummary = async (newSummary: NewSummary, locale: string) => {
  const { createWebPageSummary } = await strapiClient.request(
    graphql(`
      mutation CreateWebPageSummary(
        $data: WebPageSummaryInput!
        $locale: I18NLocaleCode!
      ) {
        createWebPageSummary(data: $data, locale: $locale) {
          data {
            id
            attributes {
              locale
              summary
              keywords
              largeLanguageModel
              scraped_web_page {
                data {
                  id
                }
              }
              lastScrapeUpdate
              prompt {
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
    {
      data: newSummary,
      locale,
    },
  )

  console.log(
    `Created WebPageSummary for ${locale} with id:`,
    createWebPageSummary?.data?.id,
  )
}
