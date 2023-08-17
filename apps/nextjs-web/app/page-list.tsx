import { registerUrql } from '@urql/next/rsc'
import { InfoCard } from './components/info-card/info-card'
import { cacheExchange, createClient, fetchExchange } from '@urql/core'
import { graphql } from '@/src/gql'

const GegScrapedWebPagesQuery = graphql(`
  query GetScrapedWebPages {
    allPages {
      url
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
  const result = await getClient().query(GegScrapedWebPagesQuery, {})
  console.log('result:', result.data?.allPages)

  const pages = result.data?.allPages

  return (
    <>
      {pages?.map((page) => (
        <div key={page.url}>
          <InfoCard page={page} />
        </div>
      ))}
    </>
  )
}
