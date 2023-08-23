import { registerUrql } from '@urql/next/rsc'
import { InfoCard } from './components/info-card/info-card'
import { cacheExchange, createClient, fetchExchange } from '@urql/core'
import { graphql } from '@/src/gql'

const GetScrapedWebPagesQuery = graphql(`
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
  const result = await getClient().query(GetScrapedWebPagesQuery, {})
  const pages = result.data?.searchResult

  return (
    <>
      {pages?.map((page) => (
        <div key={page.id}>
          <InfoCard page={page} />
        </div>
      ))}
    </>
  )
}
