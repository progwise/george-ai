import { ChatOllama } from '@langchain/ollama'

import { ollamaResourceManager } from './ollama-resource-manager.js'

export const getOllamaChatModel = async (modelName: string) => {
  // Select best OLLAMA instance that has this specific model
  const { instance } = await ollamaResourceManager.getBestInstance(modelName)
  const headers = new Headers()

  if (instance.config.apiKey) {
    headers.append('X-API-Key', instance.config.apiKey)
  }
  return new ChatOllama({
    model: modelName,
    baseUrl: instance.config.url,
    headers,
  })
}
