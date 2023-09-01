import { builder } from '../builder'
import { FragmentType, graphql, useFragment } from '../gql'
import { GraphQLClient } from 'graphql-request'
import dotenv from 'dotenv'
import { WebPageSummaryFragment } from '../gql/graphql'

dotenv.config()

const endpoint = 'http://localhost:1337/graphql'
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
  },
})

const WebPageSummaryReference =
  builder.objectRef<WebPageSummaryFragment>('WebPageSummary')

builder.objectType(WebPageSummaryReference, {
  name: 'WebPageSummary',
  fields: (t) => ({
    id: t.string({ resolve: (parent) => parent.id ?? '' }),
    url: t.string({
      resolve: (parent) => {
        return parent.attributes?.scraped_web_pages?.data?.attributes?.url ?? ''
      },
    }),
    title: t.string({
      resolve: (parent) =>
        parent.attributes?.scraped_web_pages?.data?.attributes?.title ?? '',
    }),
    locale: t.string({
      resolve: (parent) => parent.attributes?.locale ?? '',
    }),
    publishedAt: t.string({
      resolve: (parent) =>
        parent.attributes?.scraped_web_pages?.data?.attributes?.publishedAt ??
        '',
    }),
    originalContent: t.string({
      resolve: (parent) =>
        parent.attributes?.scraped_web_pages?.data?.attributes
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
        const result = await client.request(
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
        const webPageSummarydatas = result.webPageSummaries?.data ?? []
        return webPageSummarydatas.map((data) => {
          return useFragment(
            graphql(`
              fragment WebPageSummary on WebPageSummaryEntity {
                id
                attributes {
                  locale
                  keywords
                  summary
                  largeLanguageModel
                  scraped_web_pages {
                    data {
                      attributes {
                        title
                        url
                        originalContent
                        publishedAt
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
