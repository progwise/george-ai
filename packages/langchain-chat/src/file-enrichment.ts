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
  languageModel,
  instruction,
}: {
  file: File
  languageModel: string | null
  instruction: string | null
}) => {
  console.log(`Getting enriched value for ${file.id}`)

  if (!languageModel) {
    throw new Error('Cannot enrich file without language model')
  }
  if (!instruction) {
    throw new Error('Cannot enrich without instruction')
  }
  try {
    const markdownPath = getMarkdownFilePath({ fileId: file.id, libraryId: file.libraryId, errorIfNotExists: true }) //TODO?: error handling check
    const markdown = await fs.promises.readFile(markdownPath, 'utf-8')
    const model = new ChatOllama({
      model: languageModel,
      baseUrl: process.env.OLLAMA_BASE_URL,
    })
    const prompt = await getEnrichmentPrompt({ instruction, markdown, filename: file.name, originUri: file.originUri })
    const instructionPromptResult = await model.invoke(prompt, {})
    return instructionPromptResult.content.toString()
  } catch (error) {
    console.error(`Error reading file ${file.id}:`, error)
    throw new Error(`Failed to read file ${file.id}: ${(error as Error).message}`)
  }
}

const getEnrichmentPrompt = async ({
  instruction,
  markdown,
  filename,
  originUri,
}: {
  instruction: string
  markdown: string
  filename: string
  originUri: string | null
}) => {
  const prompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You help to extract data from a markdown to use your result as column values in a table sheet.
        You have to answer with this value only that fits into a cell of a spreadsheet. No additional text, explanation or white space is allowed.
        `,
    ],
    ['system', 'Here is the Markdown:'],
    new MessagesPlaceholder('markdown'),
    ['system', 'Here is the filename:'],
    new MessagesPlaceholder('filename'),
    ['system', 'Here is the URL of the original file:'],
    new MessagesPlaceholder('originUri'),
    ['user', 'This is the instruction what information to extract:'],
    new MessagesPlaceholder('instruction'),
  ])

  return await prompt.invoke({
    markdown,
    filename,
    originUri,
    instruction,
  })
}
