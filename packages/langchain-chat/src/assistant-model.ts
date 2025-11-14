import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai'

import { getModelSettings } from '@george-ai/ai-service-client'

export type AssistantModel = ChatOllama | ChatOpenAI<ChatOpenAICallOptions>
// BaseChatModel<BaseChatModelCallOptions, AIMessageChunk>

export const getModel = async (modelProvider: string, modelName: string) => {
  const modelSettings = await getModelSettings(modelProvider, modelName)
  if (modelProvider === 'ollama') {
    return new ChatOllama({
      model: modelName,
      baseUrl: modelSettings.baseUrl,
      headers: modelSettings.headers,
    })
  } else if (modelProvider === 'openai') {
    return new ChatOpenAI({
      modelName: modelName,
      apiKey: modelSettings.apiKey,
    })
  } else {
    throw new Error(`Unsupported model provider: ${modelProvider}`)
  }
}
