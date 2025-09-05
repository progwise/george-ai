import { isChatModel, isEmbeddingModel, isVisionModel } from './model-classifier'
import { ollamaResourceManager } from './ollama-resource-manager'

/**
 * Get all unique models from all Ollama instances
 */
async function getAllAvailableModels() {
  // Get all unique model names from all instances
  const instanceList = await ollamaResourceManager.getInstanceList()
  const allModels = new Set<string>()
  for (const instance of instanceList) {
    if (instance.availableModels) {
      instance.availableModels.forEach((model) => allModels.add(model))
    }
  }

  return Array.from(allModels).sort((a, b) => a.localeCompare(b))
}

/**
 * Get available chat models from all Ollama instances
 */
export const getChatModels = async () => {
  const allModels = await getAllAvailableModels()
  return allModels.filter(isChatModel).map((name) => ({ name, model: name }))
}

/**
 * Get available OCR-capable vision models for image-to-text extraction
 */
export const getOCRModels = async () => {
  const allModels = await getAllAvailableModels()
  return allModels.filter(isVisionModel).map((name) => ({ name, model: name }))
}

/**
 * Get available embedding models from all Ollama instances
 */
export const getEmbeddingModels = async () => {
  const allModels = await getAllAvailableModels()
  return allModels.filter(isEmbeddingModel).map((name) => ({ name, model: name }))
}
