import { OpenAIModel } from '../openAi'
import { OllamaModel, getOllamaModels } from './ollama-api'
import { getClusterStatus } from './ollama-cluster-status'

export { getOllamaEmbedding } from './ollama-embed'
export { ollamaChat } from './ollama-chat'
export const getOllamaClusterStatus = (workspaceId: string) => {
  return getClusterStatus(workspaceId)
}

export * as ollamaApi from './ollama-api'
export { getOllamaModels, type OllamaModel } from './ollama-api'
export {
  getOllamaResourceManager,
  invalidateOllamaResourceManager,
  clearAllOllamaResourceManagers,
} from './ollama-resource-manager'

export type DiscoveredModel = OllamaModel | OpenAIModel

/**
 * Test Ollama provider connection
 * Used for validating credentials before saving provider configuration
 */
export const testOllamaConnection = async (params: {
  url: string
  apiKey?: string
}): Promise<{ success: boolean; error?: string }> => {
  try {
    await getOllamaModels(params)
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
