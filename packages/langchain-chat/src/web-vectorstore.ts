import { TavilySearchAPIRetriever } from '@langchain/community/retrievers/tavily_search_api'
const WEB_RETRIEVAL_K = 4

const retrieverWeb = new TavilySearchAPIRetriever({
  k: WEB_RETRIEVAL_K,
})

export const getWebContent = async ({
  question,
}: {
  question: string
}): Promise<string> => {
  try {
    const webQuery = `${question}`

    const webDocuments = await retrieverWeb.invoke(webQuery)

    if (!webDocuments || !Array.isArray(webDocuments)) {
      throw new Error('Invalid response format: Expected an array of documents')
    }

    const content = webDocuments
      .map((document_) => document_.pageContent)
      .join('\n\n')

    if (!content) {
      throw new Error('No content retrieved from web documents')
    }

    return JSON.stringify(content, null, 2)
  } catch (error) {
    console.error('Error retrieving web content:', error)
    if ((error as any).response?.status === 401) {
      console.error('Authentication failed. Check API credentials.')
      return 'Authentication error: Unable to retrieve web information.'
    } else if ((error as any).response?.status === 404) {
      console.error('Resource not found. Check the API endpoint.')
      return 'Resource not found: Unable to retrieve web information.'
    } else {
      console.error('Unexpected error:', error)
      return `Unable to retrieve specific web information about ${question}`
    }
  }
}
