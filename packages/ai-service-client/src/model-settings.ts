import { ollamaResourceManager } from './ollama/ollama-resource-manager'

export const getModelSettings = async (modelProvider: string, modelName: string) => {
  if (modelProvider === 'ollama') {
    // Return Ollama model settingsimport { ollamaResourceManager } from './ollama-resource-manager.js'

    // Select best OLLAMA instance that has this specific model
    const { instance } = await ollamaResourceManager.getBestInstance(modelName)
    const headers = new Headers()

    if (instance.config.apiKey) {
      headers.append('X-API-Key', instance.config.apiKey)
    }
    return {
      baseUrl: instance.config.url,
      modelName: modelName,
      headers,
      apiKey: instance.config.apiKey,
    }
  } else if (modelProvider === 'openai') {
    // Return OpenAI model settings
    const apiKey = process.env.OPEN_AI_KEY
    if (!apiKey) {
      throw new Error('OPEN_AI_KEY environment variable is not set')
    }
    const baseUrl = process.env.OPEN_AI_API_URL || 'https://api.openai.com/v1'
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${apiKey}`)
    headers.append('Content-Type', 'application/json')

    return {
      baseUrl,
      modelName,
      headers,
      apiKey,
    }
  } else {
    throw new Error(`Unsupported model provider: ${modelProvider}`)
  }
}
