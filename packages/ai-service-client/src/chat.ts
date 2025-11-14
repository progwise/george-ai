import { ollamaChat } from './ollama/ollama-chat'
import { openAIChat } from './openAi'
import { ChatOptions } from './types'

export const chat = async (chatOptions: ChatOptions) => {
  if (chatOptions.modelProvider === 'ollama') {
    return ollamaChat(chatOptions)
  } else if (chatOptions.modelProvider === 'openai') {
    return openAIChat(chatOptions)
  } else {
    throw new Error(`Unsupported chat model provider: ${chatOptions.modelProvider}`)
  }
}
