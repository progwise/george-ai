import { ChatOllama } from '@langchain/ollama'

import { ollamaResourceManager } from './ollama-resource-manager.js'

export const getOllamaChatModel = async (modelName: string) => {
  // Select best OLLAMA instance that has this specific model
  const { instance } = await ollamaResourceManager.selectBestInstance(modelName)
  const headers = new Headers()

  if (instance.apiKey) {
    headers.append('X-API-Key', instance.apiKey)
  }
  return new ChatOllama({
    model: modelName,
    baseUrl: instance.url,
    headers,
  })
}
