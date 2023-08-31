import { registerUrql } from '@urql/next/rsc'
import { InfoCard } from './components/info-card/info-card'
import { cacheExchange, createClient, fetchExchange } from '@urql/core'
import { graphql } from '@/src/gql'

import { PublicationState } from '@/src/gql/graphql'
import { FilterSelectionProps } from './components/filter-selection'

const SearchQuery = graphql(`
  query GetIndexedWebPage(
    $query: String
    $language: String
    $publicationState: PublicationState
    $largeLanguageModel: String
  ) {
    searchResult(
      query: $query
      language: $language
      publicationState: $publicationState
      largeLanguageModel: $largeLanguageModel
    ) {
      id
      ...InfoCard
    }
  }
`)

const makeClient = () => {
  return createClient({
    url: 'http://localhost:3000/graphql',
    exchanges: [cacheExchange, fetchExchange],
  })
}

const { getClient } = registerUrql(makeClient)

interface PageListProps extends FilterSelectionProps {
  query?: string
}

export async function PageList({ query, lang, status, llm }: PageListProps) {
  const result = await getClient().query(SearchQuery, {
    query,
    language: lang,
    publicationState:
      status === 'published'
        ? PublicationState.Published
        : PublicationState.Draft,
    largeLanguageModel: llm,
  })
  const pages = result.data?.searchResult
  console.log('pages:', pages)

  return (
    <>{pages?.map((page) => <InfoCard key={page.id} pageFragment={page} />)}</>
  )
}
