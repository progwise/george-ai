import { getClusterStatus } from './ollama-cluster-status'

export { getOllamaEmbedding } from './ollama-embed'
export { ollamaChat } from './ollama-chat'
export const getOllamaClusterStatus = (workspaceId: string) => {
  return getClusterStatus(workspaceId)
}

export { getOllamaModels, type OllamaModel } from './ollama-api'
export { getOllamaResourceManager, invalidateOllamaResourceManager } from './ollama-resource-manager'
