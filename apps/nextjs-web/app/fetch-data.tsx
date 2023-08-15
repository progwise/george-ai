import { graphql } from '@/src/gql'
import { GetScrapedWebPagesQuery } from '@/src/gql/graphql'

const GET_SCRAPED_WEB_PAGES_QUERY = graphql(`
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
`)

const fetchData = async (): Promise<GetScrapedWebPagesQuery> => {
  try {
    const response = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
      },
      body: JSON.stringify({
        query: GET_SCRAPED_WEB_PAGES_QUERY,
      }),
    })

    const result = await response.json()
    return result.data
  } catch (error) {
    throw error
  }
}

export default fetchData
