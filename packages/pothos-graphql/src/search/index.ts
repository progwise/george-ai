import { builder } from '../builder'
import { Client } from 'typesense'
import {
  SearchResponse,
  SearchResponseHit,
} from 'typesense/lib/Typesense/Documents'

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

type TypesenseWebPage = {
  id: string
  title: string
  url: string
  language: string
  originalContent: string
  publicationState?: string
  keywords: string
  summary: string
  largeLanguageModel: string
}

export const TypesenseWebPageReference = builder.objectRef<
  TypesenseWebPage | undefined
>('TypesenseWebPage')

builder.objectType(TypesenseWebPageReference, {
  name: 'TypesenseWebPage',
  fields: (t) => ({
    id: t.string({ resolve: (parent) => parent?.id ?? '' }),
    title: t.string({ resolve: (parent) => parent?.title ?? '' }),
    url: t.string({ resolve: (parent) => parent?.url ?? '' }),
    language: t.string({ resolve: (parent) => parent?.language ?? '' }),
    originalContent: t.string({
      resolve: (parent) => parent?.originalContent ?? '',
    }),
    publicationState: t.string({
      resolve: (parent) => parent?.publicationState ?? '',
    }),
    keywords: t.string({ resolve: (parent) => parent?.keywords ?? '' }),
    summary: t.string({ resolve: (parent) => parent?.summary ?? '' }),
    largeLanguageModel: t.string({
      resolve: (parent) => parent?.largeLanguageModel ?? '',
    }),
  }),
})

export const resolveSearchResult = async (
  query: string,
  largeLanguageModel?: string,
  publicationState?: string,
  language?: string,
) => {
  let filter = ''
  if (largeLanguageModel) {
    filter += `largeLanguageModel:${largeLanguageModel} && `
  }
  if (publicationState) {
    filter += `publicationState:${publicationState} && `
  }
  if (language) {
    filter += `language:${language} && `
  }
  filter = filter.slice(0, -4)

  try {
    const response = await client
      .collections<TypesenseWebPage>('scraped_web_pages_summaries')
      .documents()
      .search({
        q: query,
        query_by: 'keywords',
        filter_by: filter,
      })

    return response.hits?.map((hit) => hit.document) || []
  } catch (error) {
    console.error('Error fetching data from Typesense:', error)
    return []
  }
}
