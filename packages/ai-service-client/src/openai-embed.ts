import { generateOpenAIEmbeddings } from './openai-api.js'

export interface OpenAIEmbeddingOptions {
  apiKey: string
  baseUrl?: string
}

export const getOpenAIEmbedding = async (
  embeddingModelName: string,
  question: string,
  options: OpenAIEmbeddingOptions,
) => {
  const baseUrl = options.baseUrl || 'https://api.openai.com/v1'

  const result = await generateOpenAIEmbeddings({ url: baseUrl, apiKey: options.apiKey }, embeddingModelName, question)

  return result
}
