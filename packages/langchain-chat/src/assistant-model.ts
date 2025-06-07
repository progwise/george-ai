import { BaseChatModel, BaseChatModelCallOptions } from '@langchain/core/language_models/chat_models'
import { AIMessageChunk } from '@langchain/core/messages'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI } from '@langchain/openai'

export type AssistantModel = BaseChatModel<BaseChatModelCallOptions, AIMessageChunk>

export const getExternalModels = () => {
  const models = [
    {
      modelName: 'gpt-4o-mini',
      title: 'GPT-4 Mini',
      type: 'OpenAI',
      options: [
        { key: 'temperature', value: '0.7' },
        { key: 'maxTokens', value: '80000' },
      ],
      baseUrl: undefined as string | undefined,
    },
    {
      modelName: 'gemini-1.5-pro',
      title: 'Gemini 1.5 Pro',
      type: 'Google',
      options: [
        { key: 'temperature', value: '0.0' },
        { key: 'maxRetries', value: '2' },
      ],
      baseUrl: undefined,
    },
  ]

  return models
}

export const getOllamalModels = async () => {
  if (!process.env.OLLAMA_BASE_URL || process.env.OLLAMA_BASE_URL.length < 1) {
    throw new Error('OLLAMA_BASE_URL environment variable is not set')
  }
  const ollamaModelsResponse = await fetch(`${process.env.OLLAMA_BASE_URL}/api/tags`)
  if (!ollamaModelsResponse.ok) {
    throw new Error('Failed to fetch OLLAMA models')
  }
  const ollamaModelsContent = await ollamaModelsResponse.json()
  const foundModels = ollamaModelsContent.models.map((model: { name: string; model: string }) => ({
    modelName: model.name,
    title: model.model,
    type: 'Ollama',
    options: [
      { key: 'temperature', value: '0.7' },
      { key: 'maxTokens', value: '80000' },
    ],
  }))
  return foundModels as { modelName: string; title: string; type: string; options: { key: string; value: string }[] }[]
}

export const getModel = async (modelName: string): Promise<AssistantModel> => {
  const externalModels = getExternalModels()
  const extermanModel = externalModels.find((model) => model.modelName === modelName)
  if (extermanModel) {
    return getModelInstance(extermanModel)
  }

  const ollamaModels = await getOllamalModels()
  const ollamaModel = ollamaModels.find((model) => model.modelName === modelName)
  if (!ollamaModel) {
    throw new Error(`Model ${modelName} not found in external models or OLLAMA models`)
  }

  return getModelInstance(ollamaModel)
}

const getModelInstance = (model: { modelName: string; type: string }): AssistantModel => {
  if (model.type === 'Ollama') {
    return new ChatOllama({
      model: model.modelName,
      baseUrl: process.env.OLLAMA_BASE_URL,
    })
  }
  switch (model.modelName) {
    case 'gpt-4o-mini':
      return new ChatOpenAI({
        modelName: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 500,
      })
    case 'gemini-1.5-pro':
      return new ChatGoogleGenerativeAI({
        model: 'gemini-1.5-pro',
        temperature: 0,
        maxRetries: 2,
        // other params...
      })
  }
  throw new Error(`Unknown language model: ${model.modelName}`)
}
