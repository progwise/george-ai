import { strapiClient } from '../strapi-graphql-client'
import { graphql } from '../gql'
import { builder } from '../builder'
import { WebPageSummaryFragment } from '../gql/graphql'

interface AllLanguageAndLargeLanguageModel {
  language: string[]
  largeLanguageModel: string[]
}

const AllLanguageAndLargeLanguageModelReference =
  builder.objectRef<AllLanguageAndLargeLanguageModel>(
    'AllLanguageAndLargeLanguageModel',
  )

builder.objectType(AllLanguageAndLargeLanguageModelReference, {
  name: 'AllLanguageAndLargeLanguageModel',
  fields: (t) => ({
    language: t.stringList({
      resolve: (parent) => parent.language ?? [],
    }),
    largeLanguageModel: t.stringList({
      resolve: (parent) => parent.largeLanguageModel ?? [],
    }),
  }),
})

builder.queryField('allLanguageAndLargeLanguageModel', (t) =>
  t.field({
    type: AllLanguageAndLargeLanguageModelReference,
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
