import { generateOpenAIEmbeddings } from './openai-api.js'

export const getOpenAIEmbedding = async (embeddingModelName: string, question: string, apiKey: string) => {
  const baseUrl = 'https://api.openai.com/v1'
  if (!apiKey) {
    throw new Error('OPEN_AI_KEY environment variable is not set')
  }

  const result = await generateOpenAIEmbeddings({ url: baseUrl, apiKey }, embeddingModelName, question)

  return result
}
