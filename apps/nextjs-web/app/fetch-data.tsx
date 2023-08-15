import { Page } from './page'

const fetchData = async (): Promise<Page[]> => {
  try {
    const response = await fetch('http://localhost:3000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
      },
      body: JSON.stringify({
        query: `
            query GetScrapedWebPages {
              allPages {
                title
                url
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
          `,
      }),
    })

    const result = await response.json()
    return result.data.allPages
  } catch (error) {
    throw error
  }
}

export default fetchData
