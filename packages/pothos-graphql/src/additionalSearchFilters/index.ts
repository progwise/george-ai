import { strapiClient } from '../strapi-graphql-client'
import { graphql } from '../gql'
import { builder } from '../builder'
import { WebPageSummaryFragment } from '../gql/graphql'

interface AdditionalSearchFiltersType {
  language: string[]
  largeLanguageModel: string[]
}

const AdditionalSearchFiltersReference =
  builder.objectRef<AdditionalSearchFiltersType>('AdditionalSearchFilters')

builder.objectType(AdditionalSearchFiltersReference, {
  name: 'AdditionalSearchFilters',
  fields: (t) => ({
    language: t.stringList({
      resolve: (parent) => parent.language ?? [],
    }),
    largeLanguageModel: t.stringList({
      resolve: (parent) => parent.largeLanguageModel ?? [],
    }),
  }),
})

builder.queryField('additionalSearchFilters', (t) =>
  t.field({
    type: AdditionalSearchFiltersReference,
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
        }
      } catch (error) {
        console.error('Error fetching data from Strapi:', error)
        return {
          language: [],
          largeLanguageModel: [],
        }
      }
    },
  }),
)
