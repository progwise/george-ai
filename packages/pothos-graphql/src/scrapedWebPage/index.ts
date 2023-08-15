import { builder } from '../builder'
import { graphql } from '../gql'
import { GraphQLClient } from 'graphql-request'
import dotenv from 'dotenv'
import {
  Maybe,
  ScrapedWebPage,
  ComponentWebPageSummaryWebPageSummary,
  Enum_Componentwebpagesummarywebpagesummary_Feedback,
} from '../gql/graphql'

dotenv.config()

const endpoint = 'http://localhost:1337/graphql'
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
  },
})

const ALL_SCRAPED_PAGES_QUERY = graphql(`
  query GetScrapedWebPages {
    scrapedWebPages(publicationState: PREVIEW, locale: "all") {
      data {
        id
        attributes {
          Title
          Url
          OriginalContent
          locale
          publishedAt
          WebPageSummaries {
            id
            Feedback
            LargeLanguageModel
            GeneratedKeywords
            GeneratedSummary
          }
        }
      }
    }
  }
`)

const FeedbackEnumReference = builder.enumType(
  Enum_Componentwebpagesummarywebpagesummary_Feedback,
  {
    name: 'Enum_Feedback',
  },
)

const ScrapedWebPageReference =
  builder.objectRef<Maybe<ScrapedWebPage | undefined>>('ScrapedWebPage')

const WebPageSummaryReference =
  builder.objectRef<Maybe<ComponentWebPageSummaryWebPageSummary | undefined>>(
    'WebPageSummary',
  )

builder.objectType(WebPageSummaryReference, {
  name: 'WebPageSummary',
  fields: (t) => ({
    id: t.string({ resolve: (parent) => parent?.id ?? '' }),
    feedback: t.field({
      type: FeedbackEnumReference,
      resolve: (parent) => parent?.Feedback,
      nullable: true,
    }),
    largeLanguageModel: t.string({
      resolve: (parent) => parent?.LargeLanguageModel ?? '',
    }),
    generatedSummary: t.string({
      resolve: (parent) => parent?.GeneratedSummary ?? '',
    }),
    generatedKeywords: t.string({
      resolve: (parent) => parent?.GeneratedKeywords ?? '',
    }),
  }),
})

builder.objectType(ScrapedWebPageReference, {
  name: 'ScrapedWebPage',
  fields: (t) => ({
    url: t.string({ resolve: (parent) => parent?.Url ?? '' }),
    title: t.string({ resolve: (parent) => parent?.Title ?? '' }),
    locale: t.string({ resolve: (parent) => parent?.locale ?? '' }),
    publishedAt: t.string({ resolve: (parent) => parent?.publishedAt ?? '' }),
    originalContent: t.string({
      resolve: (parent) => parent?.OriginalContent ?? '',
    }),
    webPageSummaries: t.field({
      type: [WebPageSummaryReference],
      resolve: (parent) => parent?.WebPageSummaries ?? [],
      nullable: true,
    }),
  }),
})

builder.queryType({
  fields: (t) => ({
    allPages: t.field({
      type: [ScrapedWebPageReference],
      resolve: async () => {
        const result = await client.request(ALL_SCRAPED_PAGES_QUERY, {})
        const data = result.scrapedWebPages?.data ?? []
        const attributes = data.map((entity) => entity.attributes) ?? []
        return attributes.map((attribute) => ({
          Url: attribute?.Url,
          Title: attribute?.Title,
          OriginalContent: attribute?.OriginalContent,
          locale: attribute?.locale,
          publishedAt: attribute?.publishedAt,
          WebPageSummaries: attribute?.WebPageSummaries?.map((summary) => ({
            id: summary?.id ?? '',
            Feedback: summary?.Feedback,
            LargeLanguageModel: summary?.LargeLanguageModel,
            GeneratedKeywords: summary?.GeneratedKeywords,
            GeneratedSummary: summary?.GeneratedSummary,
          })),
        }))
      },
    }),
  }),
})
