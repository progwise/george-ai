import { builder } from '../builder'
import { Client } from 'typesense'

const client = new Client({
  nodes: [
    {
      host: process.env.TYPESENSE_API_HOST ?? '',
      port: Number.parseInt(process.env.TYPESENSE_API_PORT ?? '0'),
      protocol: process.env.TYPESENSE_API_PROTOCOL ?? '',
    },
  ],

  apiKey: process.env.TYPESENSE_API_KEY ?? '',
})

enum PublicationState {
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

function generateFilterClauses(field: string, values: string[]): string {
  return `${field}:[${values}]`
}

builder.queryField('searchResult', (t) =>
  t.field({
    type: [IndexedWebPageReference],
    args: {
      query: t.arg.string(),
      largeLanguageModel: t.arg.stringList(),
      // publicationState: t.arg({
      //   type: PublicationState[],
      // }),
      publicationState: t.arg.stringList(),
      language: t.arg.stringList(),
    },
    resolve: async (parent, arguments_) => {
      const filters: string[] = []
      // if (arguments_.largeLanguageModel) {
      //   filters.push(`largeLanguageModel:${arguments_.largeLanguageModel}`)
      // }
      // if (arguments_.publicationState) {
      //   filters.push(`publicationState:${arguments_.publicationState}`)
      // }
      // if (arguments_.language) {
      //   filters.push(`language:${arguments_.language}`)
      // }

      if (
        arguments_.largeLanguageModel &&
        arguments_.largeLanguageModel.length > 0
      ) {
        filters.push(
          generateFilterClauses(
            'largeLanguageModel',
            arguments_.largeLanguageModel,
          ),
        )
      }
      if (
        arguments_.publicationState &&
        arguments_.publicationState.length > 0
      ) {
        filters.push(
          generateFilterClauses(
            'publicationState',
            arguments_.publicationState,
          ),
        )
      }
      if (arguments_.language && arguments_.language.length > 0) {
        filters.push(generateFilterClauses('language', arguments_.language))
      }
      const filterExpression = filters.join(' && ')

      console.log('filterExpression:', filterExpression)
      try {
        const response = await client
          .collections<IndexedWebPage>('scraped_web_pages_summaries')
          .documents()
          .search({
            q: arguments_.query ?? '*',
            query_by: 'keywords',
            filter_by: filterExpression,
          })

        return response.hits?.map((hit) => hit.document) || []
      } catch (error) {
        console.error('Error fetching data from Typesense:', error)
        return []
      }
    },
  }),
)
