import { classifyModel } from './classify-model'

export const MODEL_CAPABILITIES = ['chat', 'embedding', 'vision', 'ocr', 'functionCalling']
export type ModelCapability = (typeof MODEL_CAPABILITIES)[number]

export const getModelCapabilities = (modelName: string): ModelCapability[] => {
  const classification = classifyModel(modelName)
  const capabilities: string[] = []

  if (classification.isChatModel) {
    capabilities.push('chat')
  }
  if (classification.isEmbeddingModel) {
    capabilities.push('embedding')
  }
  if (classification.isVisionModel) {
    capabilities.push('vision')
    capabilities.push('ocr')
  }

  return capabilities
}
