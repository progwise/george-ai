import { getClusterStatus } from './ollama-cluster-status'

export { getOllamaEmbedding } from './ollama-embed'
export const getOllamaClusterStatus = () => {
  return getClusterStatus()
}

export { getOllamaModels, type OllamaModel } from './ollama-api'
