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

export enum PublicationState {
  Draft = 'draft',
  Published = 'published',
}

type TypesenseWebPage = {
  id: string
  title: string
  url: string
  language: string
  originalContent: string
  publicationState: PublicationState
  keywords: string
  summary: string
  largeLanguageModel: string
}

const PublicationStateEnumReference = builder.enumType(PublicationState, {
  name: 'PublicationState',
})

export const TypesenseWebPageReference =
  builder.objectRef<TypesenseWebPage>('TypesenseWebPage')

builder.objectType(TypesenseWebPageReference, {
  name: 'TypesenseWebPage',
  fields: (t) => ({
    id: t.exposeString('id'),
    title: t.exposeString('title'),
    url: t.exposeString('url'),
    language: t.exposeString('language'),
    originalContent: t.exposeString('originalContent'),
    publicationState: t.expose('publicationState', {
      type: PublicationStateEnumReference,
    }),
    keywords: t.exposeString('keywords'),
    summary: t.exposeString('summary'),
    largeLanguageModel: t.exposeString('largeLanguageModel'),
  }),
})

export const resolveSearchResult = async (
  query: string,
  largeLanguageModel?: string,
  publicationState?: PublicationState,
  language?: string,
) => {
  const filters: string[] = []
  if (largeLanguageModel) {
    filters.push(`largeLanguageModel:${largeLanguageModel}`)
  }
  if (publicationState) {
    filters.push(`publicationState:${publicationState}`)
  }
  if (language) {
    filters.push(`language:${language}`)
  }

  try {
    const response = await client
      .collections<TypesenseWebPage>('scraped_web_pages_summaries')
      .documents()
      .search({
        q: query,
        query_by: 'keywords',
        filter_by: filters.join(' && '),
      })

    return response.hits?.map((hit) => hit.document) || []
  } catch (error) {
    console.error('Error fetching data from Typesense:', error)
    return []
  }
}
