import { graphql } from '../gql/gql'
import { strapiClient } from '../strapi-client'

export const getAllOutdatedSummaries = async () => {
  const { webPageSummaries } = await strapiClient.request(
    graphql(`
      query GetOutdatedWebPageSummaries {
        webPageSummaries(publicationState: PREVIEW, locale: "all") {
          data {
            id
            attributes {
              lastScrapeUpdate
              scraped_web_page {
                data {
                  id
                  attributes {
                    updatedAt
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
              prompt {
                promptForSummary
                promptForKeywords
                largeLanguageModel
                language
              }
            }
          }
        }
      }
    `),
    {},
  )
  return (
    webPageSummaries?.data
      .filter(({ attributes }) => {
        const updatedAt =
          attributes?.scraped_web_page?.data?.attributes?.updatedAt
        const lastScrapeUpdate = attributes?.lastScrapeUpdate
        const keywordPrompt = attributes?.prompt?.promptForKeywords
        const summaryPrompt = attributes?.prompt?.promptForSummary
        const language = attributes?.prompt?.language
        const entryPointPrompts =
          attributes?.scraped_web_page?.data?.attributes?.entry_point?.data?.attributes?.prompts?.filter(
            (prompt) => prompt?.language === language,
          ) ?? []

        const hasSamePrompts = entryPointPrompts.some((entryPrompt) => {
          return (
            entryPrompt?.promptForKeywords === keywordPrompt &&
            entryPrompt?.promptForSummary === summaryPrompt
          )
        })

        return updatedAt > lastScrapeUpdate || !hasSamePrompts
      })
      .map((item) => {
        const id = item.id!
        const attributes = item.attributes!
        const entryPointPrompt =
          attributes.scraped_web_page?.data?.attributes?.entry_point?.data?.attributes?.prompts?.find(
            (prompt) => prompt?.language === attributes.prompt?.language,
          )

        return {
          summaryId: id,
          scrapedPageId: attributes.scraped_web_page?.data?.id ?? '',
          originalContent:
            attributes.scraped_web_page?.data?.attributes?.originalContent ??
            '',
          prompt: {
            promptForSummary: entryPointPrompt?.promptForSummary,
            promptForKeywords: entryPointPrompt?.promptForKeywords,
            largeLanguageModel:
              entryPointPrompt?.largeLanguageModel ?? 'unspecified',
            isDefaultPrompt: entryPointPrompt?.isDefaultPrompt,
            language: entryPointPrompt?.language ?? 'en',
          },
        }
      }) ?? []
  )
}
