import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts'
import { ChatOllama } from '@langchain/ollama'
import fs from 'fs'

import { getMarkdownFilePath } from '@george-ai/file-management'

interface File {
  id: string
  libraryId: string
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
    useMarkdown: boolean
  }
}) => {
  console.log(`Getting enriched value for ${file.id}`)
  console.log('context', context)
  if (!languageModel) {
    throw new Error('Cannot enrich file without language model')
  }
  if (!instruction) {
    throw new Error('Cannot enrich without instruction')
  }
  try {
    const messages: { name: string; label: string; value: string }[] = []
    if (options.useMarkdown) {
      const markdownPath = getMarkdownFilePath({ fileId: file.id, libraryId: file.libraryId, errorIfNotExists: true }) //TODO?: error handling check
      const markdown = await fs.promises.readFile(markdownPath, 'utf-8')
      messages.push({ name: 'markdown', label: 'Here is the Markdown Summary for the file', value: markdown })
    }

    context.forEach((item) => {
      messages.push({ name: item.name, label: `Here is the context value for ${item.name}`, value: item.value })
    })

    const model = new ChatOllama({
      model: languageModel,
      baseUrl: process.env.OLLAMA_BASE_URL,
    })
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
      `You help to extract data from a markdown to use your result as column values in a table sheet.
        You have to answer with this value only that fits into a cell of a spreadsheet. No additional text, explanation or white space is allowed.
        `,
    ],
    // ['system', 'Here is the Markdown:'],
    // new MessagesPlaceholder('markdown'),
    // ['system', 'Here is the filename:'],
    // new MessagesPlaceholder('filename'),
    // ['system', 'Here is the URL of the original file:'],
    // new MessagesPlaceholder('originUri'),
    ['user', 'This is the instruction what information to extract:'],
    new MessagesPlaceholder('instruction'),
    ...contextItems,
  ])

  return await prompt.invoke({
    instruction,
    ...contextValues,
  })
}
