import { registerUrql } from '@urql/next/rsc'
import { InfoCard } from './components/info-card/info-card'
import { cacheExchange, createClient, fetchExchange } from '@urql/core'
import { graphql } from '@/src/gql'

const makeClient = () => {
  return createClient({
    url: 'http://localhost:3000/graphql',
    exchanges: [cacheExchange, fetchExchange],
  })
}

export const { getClient } = registerUrql(makeClient)

export async function PageList({ query }: { query?: string }) {
  const result = await getClient().query(
    graphql(`
      query GetIndexedWebPage($query: String) {
        searchResult(query: $query) {
          id
          ...InfoCard
        }
      }
    `),
    { query },
  )
  const pages = result.data?.searchResult

  return (
    <>
      {pages?.map((page, index) => (
        <InfoCard
          key={page.id}
          pageFragment={page}
          query={query}
          position={index}
          webPageSummaryId={page.id}
        />
      ))}
    </>
  )
}
