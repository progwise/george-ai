'use client'

import { useQuery } from '@urql/next'

const GET_SCRAPED_WEB_PAGES_QUERY = `
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

const FetchData = () => {
  const [result] = useQuery({ query: GET_SCRAPED_WEB_PAGES_QUERY })
  return result
}

export default FetchData
