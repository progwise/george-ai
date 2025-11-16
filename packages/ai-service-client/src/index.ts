import { ollamaResourceManager } from './ollama/ollama-resource-manager'

export { getEmbedding } from './embed'
export { chat } from './chat'
export type { AIResponse, Message } from './types'
export {
  isChatModel,
  isEmbeddingModel,
  isVisionModel,
  getCapabilitiesForModel,
  classifyModel,
} from './model-classifier'

export { getModelSettings } from './model-settings'

export const getOllamaModelNames = async () => {
  return ollamaResourceManager.getAvailableModelNames()
}

export const getOpenAIModelNames = async () => {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return []
  }
  const models = await import('./openAi').then((mod) =>
    mod.getOpenAIModels({
      url: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      apiKey,
    }),
  )
  return models.data.map((model) => model.id)
}

export { getOllamaClusterStatus } from './ollama'
