import { TavilySearchAPIRetriever } from '@langchain/community/retrievers/tavily_search_api'

import { chooseK } from './vec-utils'

export const getWebContent = async ({ question }: { question: string }): Promise<string> => {
  const initial = new TavilySearchAPIRetriever({ k: 4 })
  const first = await initial.invoke(question)
  const { k } = chooseK(question, first.length)

  const retriever = new TavilySearchAPIRetriever({ k })
  const docs = await retriever.invoke(question)
  return docs.map((d) => d.pageContent).join('\n\n')
}
