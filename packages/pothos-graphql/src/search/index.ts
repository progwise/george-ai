import { builder } from '../builder'
import { typesenseClient } from '../typesense-client'

export enum PublicationState {
  Draft = 'draft',
  Published = 'published',
}

type IndexedWebPage = {
  id: string
  title: string
  url: string
  language: string
  originalContent: string
  publicationState: PublicationState
  keywords: string[]
  summary: string
  largeLanguageModel: string
}

const PublicationStateEnumReference = builder.enumType(PublicationState, {
  name: 'PublicationState',
})

const IndexedWebPageReference =
  builder.objectRef<IndexedWebPage>('IndexedWebPage')

builder.objectType(IndexedWebPageReference, {
  name: 'IndexedWebPage',
  fields: (t) => ({
    id: t.exposeString('id'),
    title: t.exposeString('title'),
    url: t.exposeString('url'),
    language: t.exposeString('language'),
    originalContent: t.exposeString('originalContent'),
    publicationState: t.expose('publicationState', {
      type: PublicationStateEnumReference,
    }),
    keywords: t.exposeStringList('keywords'),
    summary: t.exposeString('summary'),
    largeLanguageModel: t.exposeString('largeLanguageModel'),
  }),
})

builder.queryField('searchResult', (t) =>
  t.field({
    type: [IndexedWebPageReference],
    args: {
      query: t.arg.string({
        required: true,
        defaultValue: '+',
      }),
      largeLanguageModel: t.arg.stringList({
        required: true,
        defaultValue: [],
      }),
      publicationState: t.arg.stringList({
        required: true,
        defaultValue: [],
      }),
      language: t.arg.stringList({
        required: true,
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

      try {
        const response = await typesenseClient
          .collections<IndexedWebPage>('scraped_web_pages_summaries')
          .documents()
          .search({
            q: arguments_.query,
            query_by: [
              'title',
              'keywords',
              'summary',
              'url',
              'originalContent',
            ],
            filter_by: filters.join(' && '),
          })

        return response.hits?.map((hit) => hit.document) || []
      } catch (error) {
        console.error('Error fetching data from Typesense:', error)
        return []
      }
    },
  }),
)
