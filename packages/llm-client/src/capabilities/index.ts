import { classifyModel } from './classify-model'

/**
 * Filters models for embedding use
 */
export const isEmbeddingModel = (modelName: string): boolean => {
  const classification = classifyModel(modelName)
  return classification.isEmbeddingModel
}

/**
 * Filters models for chat use
 */
export const isChatModel = (modelName: string): boolean => {
  const classification = classifyModel(modelName)
  return classification.isChatModel
}

/**
 * Filters models for vision/OCR use
 */
export const isVisionModel = (modelName: string): boolean => {
  const classification = classifyModel(modelName)
  return classification.isVisionModel
}

export { getModelCapabilities } from './get-capabilities'
export { classifyModel } from './classify-model'
export type { ModelClassification } from './model-classification'
