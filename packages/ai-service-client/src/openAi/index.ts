import { getOpenAIModels } from './openai-api'

export * as openAiApi from './openai-api'

export { getOpenAIEmbedding } from './openai-embed'
export { getOpenAIModels, type OpenAIModel } from './openai-api'
export { openAIChat } from './openai-chat'

export const testOpenAIConnection = async (params: {
  apiKey: string
}): Promise<{ success: boolean; error?: string }> => {
  try {
    await getOpenAIModels({ url: 'https://api.openai.com/v1', apiKey: params.apiKey })
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
