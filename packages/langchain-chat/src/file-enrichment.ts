import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'

import { getOllamaChatModel } from '@george-ai/ai-service-client'

import { similaritySearch } from './typesense-vectorstore'

interface File {
  id: string
  libraryId: string
  embeddingModelName: string
  name: string
  originUri: string | null
}

export const getEnrichedValue = async ({
  file,
  instruction,
  languageModel,
  context,
  options,
}: {
  file: File
  instruction: string | null
  languageModel: string | null
  context: { name: string; value: string }[]
  options: {
    useVectorStore: boolean
    contentQuery: string | null
  }
}) => {
  console.log(`Getting enriched value for ${file.id} with model ${languageModel}`)
  if (!languageModel) {
    throw new Error('Cannot enrich file without language model')
  }
  if (!instruction) {
    throw new Error('Cannot enrich without instruction')
  }
  try {
    const messages: { name: string; label: string; value: string }[] = []
    if (options.useVectorStore) {
      if (!options.contentQuery) {
        throw new Error('Content query is required when using vector store')
      }
      const searchResult = await similaritySearch(
        options.contentQuery,
        file.libraryId,
        file.embeddingModelName,
        file.name,
        4,
      )
      console.log('enrichment search results', searchResult)
      const searchValue = searchResult.map((result) => result.pageContent).join('\n')
      messages.push({
        name: 'vector search',
        label: 'Here is the search result in the vector store',
        value: searchValue.length ? searchValue : 'No result from vector search',
      })
    }

    context.forEach((item) => {
      messages.push({ name: item.name, label: `Here is the context value for ${item.name}`, value: item.value })
    })

    const model = getOllamaChatModel(languageModel)
    const prompt = await getEnrichmentPrompt({ instruction, messages })
    const instructionPromptResult = await model.invoke(prompt, {})
    return instructionPromptResult.content.toString()
  } catch (error) {
    console.error(`Error reading file ${file.id}:`, error)
    throw new Error(`Failed to read file ${file.id}: ${(error as Error).message}`)
  }
}

const getEnrichmentPrompt = async ({
  instruction,
  messages,
}: {
  instruction: string
  messages: { name: string; label: string; value: string }[]
}) => {
  const contextValues: Record<string, string> = {}
  const contextItems: Array<MessagesPlaceholder | ['system ' | 'user', string]> = []
  messages.forEach((message) => {
    contextItems.push(['user' as const, message.label])
    contextItems.push(new MessagesPlaceholder(message.name))
    contextValues[message.name] = message.value
  })

  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You help to extract data to use your result as column values in a table sheet. The context consists of several sources attached.
        You have to answer with this value only that fits into a cell of a spreadsheet. No additional text, explanation or white space is allowed.
        `,
    ],
    ['user', 'This is the instruction what information to extract:'],
    new MessagesPlaceholder('instruction'),
    ...contextItems,
  ])

  return await prompt.invoke({
    instruction,
    ...contextValues,
  })
}
