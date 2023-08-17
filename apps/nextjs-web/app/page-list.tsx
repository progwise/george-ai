import { registerUrql } from '@urql/next/rsc'
import { InfoCard } from './components/info-card/info-card'
// import { cacheExchange, createClient, fetchExchange, gql } from '@urql/core'
import { cacheExchange, createClient, fetchExchange } from '@urql/core'
import { graphql } from '@/src/gql'
import { ScrapedWebPageFragmentFragment } from '@/src/gql/graphql'

const WEB_PAGE_SUMMARY_FRAGMENT = graphql(`
  fragment WebPageSummaryFragment on WebPageSummary {
    id
    feedback
    generatedKeywords
    generatedSummary
    largeLanguageModel
  }
`)
const SCRAPED_WEB_PAGE_FRAGMENT = graphql(`
  fragment ScrapedWebPageFragment on ScrapedWebPage {
    title
    url
    originalContent
    locale
    publishedAt
    webPageSummaries {
      ...WebPageSummaryFragment
    }
  }
`)

const GET_SCRAPED_WEB_PAGES_QUERY = graphql(`
  ${SCRAPED_WEB_PAGE_FRAGMENT}
  ${WEB_PAGE_SUMMARY_FRAGMENT}

  query GetScrapedWebPages {
    allPages {
      ...ScrapedWebPageFragment
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
  const result = await getClient().query(GET_SCRAPED_WEB_PAGES_QUERY, {})
  console.log('result:', result.data.allPages)

  const pages = result.data.allPages

  return (
    <>
      {pages.map((page: ScrapedWebPageFragmentFragment) => (
        <div key={page.url}>
          <InfoCard page={page} />
        </div>
      ))}
    </>
  )
}
