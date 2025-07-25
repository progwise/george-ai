import { BaseChatModel, BaseChatModelCallOptions } from '@langchain/core/language_models/chat_models'
import { AIMessageChunk } from '@langchain/core/messages'
import { ChatOllama } from '@langchain/ollama'

import { isChatModel } from './model-classifier'

export type AssistantModel = BaseChatModel<BaseChatModelCallOptions, AIMessageChunk>

const getOllamaChatModels = async () => {
  if (!process.env.OLLAMA_BASE_URL || process.env.OLLAMA_BASE_URL.length < 1) {
    throw new Error('OLLAMA_BASE_URL environment variable is not set')
  }
  const ollamaModelsResponse = await fetch(`${process.env.OLLAMA_BASE_URL}/api/tags`)
  if (!ollamaModelsResponse.ok) {
    throw new Error('Failed to fetch OLLAMA models')
  }
  const ollamaModelsContent = (await ollamaModelsResponse.json()) as {
    models: { name: string; model: string }[]
  }

  return ollamaModelsContent.models
    .filter((model) => isChatModel(model.name))
    .map((model) => ({
      modelName: model.name,
      title: model.model,
      type: 'Ollama',
      options: [
        { key: 'temperature', value: '0.7' },
        { key: 'maxTokens', value: '80000' },
      ],
    }))
    .sort((a, b) => a.modelName.localeCompare(b.modelName))
}

export const getModel = async (modelName: string): Promise<AssistantModel> => {
  const ollamaModels = await getOllamaChatModels()
  const ollamaModel = ollamaModels.find((model) => model.modelName === modelName)
  if (!ollamaModel) {
    throw new Error(`Model ${modelName} not found in external models or OLLAMA models`)
  }

  return getChatModelInstance(ollamaModel)
}

const getChatModelInstance = (model: { modelName: string; type: string }): AssistantModel => {
  if (model.type === 'Ollama') {
    return new ChatOllama({
      model: model.modelName,
      baseUrl: process.env.OLLAMA_BASE_URL,
    })
  }
  throw new Error(`Unknown language model: ${model.modelName}`)
}

export const getChatModels = async () => {
  const ollamaModels = await getOllamaChatModels()
  return [...ollamaModels]
}
