import { builder } from '../builder'
import { graphql, useFragment } from '../gql'
import { strapiClient } from '@george-ai/strapi-client'
import { WebPageSummaryFragment } from '../gql/graphql'

const WebPageSummaryReference =
  builder.objectRef<WebPageSummaryFragment>('WebPageSummary')

builder.objectType(WebPageSummaryReference, {
  name: 'WebPageSummary',
  fields: (t) => ({
    id: t.string({ resolve: (parent) => parent.id ?? '' }),
    url: t.string({
      resolve: (parent) =>
        parent.attributes?.scraped_web_page?.data?.attributes?.url ?? '',
    }),
    title: t.string({
      resolve: (parent) =>
        parent.attributes?.scraped_web_page?.data?.attributes?.title ?? '',
    }),
    locale: t.string({
      resolve: (parent) => parent.attributes?.locale ?? '',
    }),
    publishedAt: t.string({
      resolve: (parent) => parent.attributes?.publishedAt ?? '',
    }),
    originalContent: t.string({
      resolve: (parent) =>
        parent.attributes?.scraped_web_page?.data?.attributes
          ?.originalContent ?? '',
    }),

    largeLanguageModel: t.string({
      resolve: (parent) => parent.attributes?.largeLanguageModel ?? '',
    }),
    summary: t.string({
      resolve: (parent) => parent.attributes?.summary ?? '',
    }),
    keywords: t.string({
      resolve: (parent) => parent.attributes?.keywords ?? '',
    }),
  }),
})
builder.queryField('allSummaries', (t) =>
  t.field({
    type: [WebPageSummaryReference],
    resolve: async () => {
      try {
        const { webPageSummaries } = await strapiClient.request(
          graphql(`
            query GetWebPageSummaries {
              webPageSummaries(publicationState: PREVIEW, locale: "all") {
                data {
                  ...WebPageSummary
                }
              }
            }
          `),
          {},
        )
        const webPageSummariesData = webPageSummaries?.data ?? []
        return webPageSummariesData.map((data) => {
          return useFragment(
            graphql(`
              fragment WebPageSummary on WebPageSummaryEntity {
                id
                attributes {
                  locale
                  keywords
                  summary
                  largeLanguageModel
                  publishedAt
                  scraped_web_page {
                    data {
                      attributes {
                        title
                        url
                        originalContent
                      }
                    }
                  }
                }
              }
            `),
            data,
          )
        })
      } catch (error) {
        console.error('Error fetching data from Strapi:', error)
        return []
      }
    },
  }),
)
