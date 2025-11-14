import { generateOpenAIEmbeddings } from './openai-api.js'

export const getOpenAIEmbedding = async (embeddingModelName: string, question: string) => {
  const baseUrl = 'https://api.openai.com/v1'
  const apiKey = process.env.OPEN_AI_KEY
  if (!apiKey) {
    throw new Error('OPEN_AI_KEY environment variable is not set')
  }

  const result = await generateOpenAIEmbeddings({ url: baseUrl, apiKey }, embeddingModelName, question)

  return result
}
