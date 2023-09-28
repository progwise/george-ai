import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const getSummaryId = async (
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
    console.error('Error while fetching WebPagesSummary:', error)
    throw error
  }
}
