import { BaseChatModel, BaseChatModelCallOptions } from '@langchain/core/language_models/chat_models'
import { AIMessageChunk } from '@langchain/core/messages'

import { isChatModel, isVisionModel } from './model-classifier'

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
    .sort((a, b) => a.name.localeCompare(b.name))
}

const getOllamaVisionModels = async () => {
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
    .filter((model) => isVisionModel(model.name))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export const getChatModels = async () => {
  const ollamaModels = await getOllamaChatModels()
  return [...ollamaModels]
}

/**
 * Get available OCR-capable vision models for image-to-text extraction
 */
export const getOCRModels = async () => {
  const ollamaVisionModels = await getOllamaVisionModels()
  return [...ollamaVisionModels]
}
