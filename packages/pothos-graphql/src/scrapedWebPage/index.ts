// import { builder } from '../builder'

// // use codegen class from strapi instead of manual FoundPage
// export class FoundPage {
//   constructor(
//     public title: string,
//     public url: string,
//   ) {}
// }

// builder.objectType(FoundPage, {
//   name: 'FoundPage',
//   fields: (t) => ({
//     title: t.exposeString('title', {}),
//     url: t.exposeString('url', {}),
//   }),
// })

// builder.queryType({
//   fields: (t) => ({
//     findPages: t.field({
//       type: [FoundPage],
//       args: {
//         q: t.arg.string(),
//       },
//       resolve: (parent, { q }) => {
//         const p1 = new FoundPage('x', 'y')
//         const p2 = new FoundPage('x1', 'y1')
//         return [p1, p2]
//       },
//     }),
//   }),
// })
import { builder } from '../builder'
import { graphql } from '../gql'
import { GraphQLClient } from 'graphql-request'
import dotenv from 'dotenv'
import {
  ComponentWebPageSummaryWebPageSummary,
  Maybe,
  ScrapedWebPage,
  ScrapedWebPageEntity,
} from '../gql/graphql'
import { InputShapeFromFields, InputFieldMap, MaybePromise } from '@pothos/core'
import { GraphQLResolveInfo } from 'graphql'

dotenv.config()

const endpoint = 'http://localhost:1337/graphql'
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer 0dbdf0867df4e7935fb44e4c09286bc7a91d93a53d5b23077a54dde0f7d7b0b80629d81bea54477f557e28a81825a7f1de5ad210516d6ef6e6e23810419e8fddabc468bce9f2b0f0584477383a6c728661ec3d6dff3269af8de07bce25a535afba65e08d11450e18089cee2980943cf0702120209e42b961907752ba2c12f941`,
  },
})

const allScrapedPagesQuery = graphql(`
  query GetScrapedWebPages {
    scrapedWebPages(publicationState: PREVIEW, locale: "all") {
      data {
        id
        attributes {
          Title
          Url
          OriginalContent
          WebPageSummaries {
            LargeLanguageModel
            GeneratedKeywords
            GeneratedSummary
          }
        }
      }
    }
  }
`)

// const datas = {
//   id: '1',
//   attributes: {
//     Title: 'title',
//     Url: 'url',
//     OriginalContent: 'originalContent',
//   },
// }

// export class Attributes {
//   constructor(
//     public Title: string,
//     public Url: string,
//     public OriginalContent: string,
//   ) {}
// }
// export class Data {
//   constructor(
//     public id: string,
//     public attributes: Attributes,
//   ) {}
// }

const ScrapedWebPage =
  builder.objectRef<Maybe<ScrapedWebPage | undefined>>('ScrapedWebPage')

const WebPageSummary =
  builder.objectRef<Maybe<ComponentWebPageSummaryWebPageSummary | undefined>>(
    'WebPageSummary',
  )

builder.objectType(WebPageSummary, {
  name: 'WebPageSummary',
  fields: (t) => ({
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

builder.objectType(ScrapedWebPage, {
  name: 'ScrapedWebPage',
  fields: (t) => ({
    url: t.string({ resolve: (parent) => parent?.Url ?? '' }),
    title: t.string({ resolve: (parent) => parent?.Title ?? '' }),
    originalContent: t.string({
      resolve: (parent) => parent?.OriginalContent ?? '',
    }),
    webPageSummaries: t.field({
      type: [WebPageSummary],
      resolve: (parent) => parent?.WebPageSummaries ?? [],
      nullable: true,
    }),
  }),
})

builder.queryType({
  fields: (t) => ({
    allPages: t.field({
      type: [ScrapedWebPage],
      resolve: async () => {
        const result = await client.request(allScrapedPagesQuery, {})
        const data = result.scrapedWebPages?.data ?? []
        const attributes = data.map((entity) => entity.attributes) ?? []
        return attributes.map((entity) => ({
          Url: entity?.Url,
          Title: entity?.Title,
          OriginalContent: entity?.OriginalContent,
          WebPageSummaries: entity?.WebPageSummaries,
        }))
      },
    }),
  }),
})
