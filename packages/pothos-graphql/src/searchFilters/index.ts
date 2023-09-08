import { strapiClient } from '../strapi-graphql-client'
import { graphql } from '../gql'
import { builder } from '../builder'
import { PublicationState } from '../search'

const searchFilters = builder.simpleObject('searchFilters', {
  fields: (t) => ({
    language: t.stringList(),
    largeLanguageModel: t.stringList(),
    publicationState: t.stringList(),
  }),
})

builder.queryField('searchFilters', (t) =>
  t.field({
    type: searchFilters,
    resolve: async () => {
      try {
        const result = await strapiClient.request(
          graphql(`
            query GetUniqueValues {
              webPageSummaries(publicationState: PREVIEW, locale: "all") {
                data {
                  attributes {
                    locale
                    largeLanguageModel
                  }
                }
              }
            }
          `),
          {},
        )
        const webPageSummaryDatas = result.webPageSummaries?.data ?? []

        const languageSet = new Set<string>()
        const largeLanguageModelSet = new Set<string>()
        const publicationStates = Object.values(PublicationState)

        for (const data of webPageSummaryDatas) {
          const { attributes } = data
          if (attributes?.locale) {
            languageSet.add(attributes.locale)
          }
          if (attributes?.largeLanguageModel) {
            largeLanguageModelSet.add(attributes.largeLanguageModel)
          }
        }

        return {
          language: [...languageSet],
          largeLanguageModel: [...largeLanguageModelSet],
          publicationState: publicationStates,
        }
      } catch (error) {
        console.error('Error fetching data from Strapi:', error)
        return {
          language: [],
          largeLanguageModel: [],
          publicationState: [],
        }
      }
    },
  }),
)
