import { builder } from '../builder'
import { typesenseClient } from '../typesense-client'

export enum PublicationState {
  Draft = 'draft',
  Published = 'published',
}

type searchWebPages = {
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

const PublicationStateEnum = builder.enumType(PublicationState, {
  name: 'PublicationState',
})

const searchWebPagesReference =
  builder.objectRef<searchWebPages>('searchWebPages')

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

builder.queryField('searchResult', (t) =>
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
          .collections<searchWebPages>('scraped_web_pages_summaries')
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
            sort_by: 'popularity:desc,_text_match:desc',
          })

        return response.hits?.map((hit) => hit.document) || []
      } catch (error) {
        console.error('Error fetching data from Typesense:', error)
        return []
      }
    },
  }),
)
