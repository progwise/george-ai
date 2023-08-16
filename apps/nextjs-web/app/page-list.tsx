'use client'

import { registerUrql } from '@urql/next/rsc'
import { InfoCard } from './components/info-card/info-card'
import { Page } from './page'
import {
  cacheExchange,
  createClient,
  fetchExchange,
  gql,
  useQuery,
} from '@urql/next'

const GET_SCRAPED_WEB_PAGES_QUERY = gql`
  query GetScrapedWebPages {
    allPages {
      title
      url
      originalContent
      locale
      publishedAt
      webPageSummaries {
        id
        feedback
        generatedKeywords
        generatedSummary
        largeLanguageModel
      }
    }
  }
`

const makeClient = () => {
  return createClient({
    url: 'http://localhost:3000/graphql',
    exchanges: [cacheExchange, fetchExchange],
  })
}

const { getClient } = registerUrql(makeClient)

export async function PageList() {
  const result = await getClient().query(GET_SCRAPED_WEB_PAGES_QUERY, {})
  console.log('result:', result.data.allPages)

  const pages = result.data.allPages

  return (
    <>
      {pages.map((page: Page) => (
        <div key={page.url}>
          <InfoCard page={page} />
        </div>
      ))}
    </>
  )
}
