import { BaseChatModel, BaseChatModelCallOptions } from '@langchain/core/language_models/chat_models'
import { AIMessageChunk } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI } from '@langchain/openai'

export type SupportedModel = 'gpt-3' | 'gpt-4' | 'gemini-1.5' | 'ollama-mistral' | 'ollama-llama3.1'
export type AssistantModel = BaseChatModel<BaseChatModelCallOptions, AIMessageChunk>

const models = new Map<SupportedModel, AssistantModel>([])

export const getModel = (languageModel: SupportedModel): AssistantModel => {
  if (models.has(languageModel)) {
    return models.get(languageModel)!
  }

  const model = getNewModelInstance(languageModel)
  models.set(languageModel, model)
  return model
}

const getNewModelInstance = (languageModel: SupportedModel): AssistantModel => {
  switch (languageModel) {
    case 'gpt-3':
      return new ChatOpenAI({
        modelName: 'gpt-3',
        temperature: 0.7,
        maxTokens: 500,
      })
    case 'gpt-4':
      return new ChatOpenAI({
        modelName: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 500,
      })
    case 'gemini-1.5':
      return new ChatGoogleGenerativeAI({
        model: 'gemini-1.5-pro',
        temperature: 0,
        maxRetries: 2,
        // other params...
      })
    case 'ollama-mistral':
      return new ChatOllama({
        baseUrl: process.env.OLLAMA_BASE_URL,
        model: 'mistral:latest',
      })
    case 'ollama-llama3.1':
      return new ChatOllama({
        model: 'llama3.1:latest',
        baseUrl: process.env.OLLAMA_BASE_URL,
      })
    default:
      throw new Error(`Unknown language model: ${languageModel}`)
  }
}
