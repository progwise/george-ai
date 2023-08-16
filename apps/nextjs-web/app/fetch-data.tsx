// 'use client'

// import { graphql } from '@/src/gql'
// import { useQuery } from 'urql'

// const GET_SCRAPED_WEB_PAGES_QUERY = graphql(`
//   query GetScrapedWebPages {
//     allPages {
//       title
//       url
//       originalContent
//       locale
//       publishedAt
//       webPageSummaries {
//         id
//         feedback
//         generatedKeywords
//         generatedSummary
//         largeLanguageModel
//       }
//     }
//   }
// `)

// const useFetchData = () => {
//   const [result] = useQuery({ query: GET_SCRAPED_WEB_PAGES_QUERY })
//   return result
// }

// export default useFetchData

'use client'

// import { graphql } from '@/src/gql'
import { gql } from '@urql/core'

import { useQuery } from 'urql'

const WEB_PAGE_SUMMARY_FRAGMENT = gql(`
  fragment WebPageSummaryFragment on WebPageSummary {
    id
    feedback
    generatedKeywords
    generatedSummary
    largeLanguageModel
  }
`)
const SCRAPED_WEB_PAGE_FRAGMENT = gql(`
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

const GET_SCRAPED_WEB_PAGES_QUERY = gql(`
  ${SCRAPED_WEB_PAGE_FRAGMENT}
  ${WEB_PAGE_SUMMARY_FRAGMENT}

  query GetScrapedWebPages {
    allPages {
      ...ScrapedWebPageFragment
    }
  }
`)

const useFetchData = () => {
  const [result] = useQuery({ query: GET_SCRAPED_WEB_PAGES_QUERY })
  return result
}

export default useFetchData
