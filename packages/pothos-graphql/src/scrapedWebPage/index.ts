import { builder } from '../builder'
import { graphql } from '../gql'
import { GraphQLClient } from 'graphql-request'
import dotenv from 'dotenv'
import {
  Maybe,
  ScrapedWebPage,
  WebPageSummary,
  WebPageSummaryEntity,
} from '../gql/graphql'

dotenv.config()

const endpoint = 'http://localhost:1337/graphql'
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
  },
})

const GET_WEBPAGE_SUMMARIES_QUERY = graphql(`
  query GetWebPageSummaries {
    webPageSummaries(publicationState: PREVIEW, locale: "all") {
      data {
        id
        attributes {
          Keywords
          Summary
          LargeLanguageModel

          scraped_web_pages {
            data {
              attributes {
                Title
                Url
                OriginalContent
                locale
                publishedAt
              }
            }
          }
        }
      }
    }
  }
`)

type EnhancedWebPageSummary = Maybe<
  Partial<WebPageSummary & ScrapedWebPage & { id: string }> | undefined
>

const WebPageSummaryReference =
  builder.objectRef<EnhancedWebPageSummary>('WebPageSummary')

builder.objectType(WebPageSummaryReference, {
  name: 'WebPageSummary',
  fields: (t) => ({
    id: t.string({ resolve: (parent) => parent?.id ?? '' }),
    url: t.string({
      resolve: (parent) => {
        return parent?.Url ?? ''
      },
    }),
    title: t.string({
      resolve: (parent) => parent?.Title ?? '',
    }),
    locale: t.string({
      resolve: (parent) => parent?.locale ?? '',
    }),
    publishedAt: t.string({
      resolve: (parent) => parent?.publishedAt ?? '',
    }),
    originalContent: t.string({
      resolve: (parent) => parent?.OriginalContent ?? '',
    }),

    largeLanguageModel: t.string({
      resolve: (parent) => parent?.LargeLanguageModel ?? '',
    }),
    summary: t.string({
      resolve: (parent) => parent?.Summary ?? '',
    }),
    keywords: t.string({
      resolve: (parent) => parent?.Keywords ?? '',
    }),
  }),
})
builder.queryField('allSummaries', (t) =>
  t.field({
    type: [WebPageSummaryReference],
    resolve: async () => {
      try {
        const result = await client.request(GET_WEBPAGE_SUMMARIES_QUERY, {})
        const webPageSummarydatas = result.webPageSummaries?.data ?? []
        return webPageSummarydatas.map(
          (data) =>
            ({
              id: data.id,
              Url: data?.attributes?.scraped_web_pages?.data?.attributes?.Url,
              Title:
                data?.attributes?.scraped_web_pages?.data?.attributes?.Title,
              OriginalContent:
                data?.attributes?.scraped_web_pages?.data?.attributes
                  ?.OriginalContent,
              locale:
                data?.attributes?.scraped_web_pages?.data?.attributes?.locale,
              publishedAt:
                data?.attributes?.scraped_web_pages?.data?.attributes
                  ?.publishedAt,
              LargeLanguageModel: data.attributes?.LargeLanguageModel,
              Keywords: data.attributes?.Keywords,
              Summary: data.attributes?.Summary,
            }) as EnhancedWebPageSummary,
        )
      } catch (error) {
        console.error('Error fetching data from Strapi:', error)
        return []
      }
    },
  }),
)
