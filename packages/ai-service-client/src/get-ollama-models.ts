import { isChatModel, isEmbeddingModel, isVisionModel } from './model-classifier'

const getOllamaChatModels = async () => {
  if (!process.env.OLLAMA_BASE_URL || process.env.OLLAMA_BASE_URL.length < 1) {
    throw new Error('OLLAMA_BASE_URL environment variable is not set')
  }
  const headers = new Headers()
  if (process.env.OLLAMA_API_KEY) {
    headers.append('X-API-Key', process.env.OLLAMA_API_KEY)
  }
  const ollamaModelsResponse = await fetch(`${process.env.OLLAMA_BASE_URL}/api/tags`, { headers })
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
  const headers = new Headers()
  if (process.env.OLLAMA_API_KEY) {
    headers.append('X-API-Key', process.env.OLLAMA_API_KEY)
  }
  const ollamaModelsResponse = await fetch(`${process.env.OLLAMA_BASE_URL}/api/tags`, { headers })
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

const getOllamaEmbeddingModels = async () => {
  if (!process.env.OLLAMA_BASE_URL || process.env.OLLAMA_BASE_URL.length < 1) {
    throw new Error('OLLAMA_BASE_URL environment variable is not set')
  }
  const headers = new Headers()
  if (process.env.OLLAMA_API_KEY) {
    headers.append('X-API-Key', process.env.OLLAMA_API_KEY)
  }
  const ollamaModelsResponse = await fetch(`${process.env.OLLAMA_BASE_URL}/api/tags`, { headers })
  if (!ollamaModelsResponse.ok) {
    throw new Error('Failed to fetch OLLAMA models')
  }
  const ollamaModelsContent = (await ollamaModelsResponse.json()) as {
    models: { name: string; model: string }[]
  }

  return ollamaModelsContent.models
    .filter((model) => isEmbeddingModel(model.name))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export const getEmbeddingModels = async () => {
  const ollamaModels = await getOllamaEmbeddingModels()
  return [...ollamaModels]
}
