import { builder } from '../builder'
import {
  WebPagesDocument,
  searchSummaryDocuments,
  PublicationState,
} from '@george-ai/typesense-client'

const PublicationStateEnum = builder.enumType(PublicationState, {
  name: 'PublicationState',
})

const searchWebPagesReference =
  builder.objectRef<WebPagesDocument>('searchWebPages')

builder.objectType(searchWebPagesReference, {
  name: 'searchWebPages',
  fields: (t) => ({
    id: t.exposeString('id'),
    title: t.exposeString('title'),
    url: t.exposeString('url'),
    language: t.exposeString('language'),
    originalContent: t.exposeString('originalContent'),
    publicationState: t.expose('publicationState', {
      type: PublicationStateEnum,
    }),
    keywords: t.exposeStringList('keywords'),
    summary: t.exposeString('summary'),
    largeLanguageModel: t.exposeString('largeLanguageModel'),
  }),
})

builder.queryField('searchWebPages', (t) =>
  t.field({
    type: [searchWebPagesReference],
    args: {
      query: t.arg.string({
        defaultValue: '*',
      }),
      largeLanguageModel: t.arg.stringList({
        defaultValue: [],
      }),
      publicationState: t.arg.stringList({
        defaultValue: [],
      }),
      language: t.arg.stringList({
        defaultValue: [],
      }),
      keywords: t.arg.stringList({
        defaultValue: [],
      }),
    },
    resolve: async (parent, arguments_) => {
      const filters: string[] = []

      if (arguments_.largeLanguageModel.length > 0) {
        filters.push(`largeLanguageModel:=[${arguments_.largeLanguageModel}]`)
      }
      if (arguments_.publicationState.length > 0) {
        filters.push(`publicationState:=[${arguments_.publicationState}]`)
      }
      if (arguments_.language.length > 0) {
        filters.push(`language:=[${arguments_.language}]`)
      }
      if (arguments_.keywords.length > 0) {
        filters.push(`keywords:[${arguments_.keywords}]`)
      }

      return await searchSummaryDocuments(
        arguments_.query,
        filters.join(' && '),
      )
    },
  }),
)
