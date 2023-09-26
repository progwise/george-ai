import { strapiClient } from '..'
import { graphql } from '../gql'

export const getWebPageSummaryId = async (
  languageModel: string,
  url: string,
  locale: string,
) => {
  try {
    const { webPageSummaries } = await strapiClient.request(
      graphql(`
        query GetWebPageSummariesByLanguageModelAndUrl(
          $languageModel: String!
          $url: String!
          $locale: String!
        ) {
          webPageSummaries(
            publicationState: PREVIEW
            locale: "all"
            filters: {
              largeLanguageModel: { eq: $languageModel }
              scraped_web_page: { url: { eq: $url } }
              locale: { eq: $locale }
            }
          ) {
            data {
              id
            }
          }
        }
      `),
      {
        languageModel,
        url,
        locale,
      },
    )
    return webPageSummaries?.data.at(0)?.id
  } catch (error) {
    console.error('An error occurred while fetching webPages summary:', error)
    throw error
  }
}
