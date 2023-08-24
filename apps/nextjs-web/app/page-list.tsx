import { registerUrql } from '@urql/next/rsc'
import { InfoCard } from './components/info-card/info-card'
import { cacheExchange, createClient, fetchExchange } from '@urql/core'
import { graphql } from '@/src/gql'

const SearchQuery = graphql(`
  query GetScrapedWebPages {
    searchResult {
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

export async function PageList() {
  const result = await getClient().query(SearchQuery, {})
  const pages = result.data?.searchResult

  return (
    <>{pages?.map((page) => <InfoCard key={page.id} pageFragment={page} />)}</>
  )
}
