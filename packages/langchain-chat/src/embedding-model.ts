import { OllamaEmbeddings } from '@langchain/ollama'

// import { isEmbeddingModel } from './model-classifier'

export const getEmbeddingModels = async () => {
  if (!process.env.OLLAMA_BASE_URL || process.env.OLLAMA_BASE_URL.length < 1) {
    throw new Error('OLLAMA_BASE_URL environment variable is not set')
  }
  const modelUrl = `${process.env.OLLAMA_BASE_URL}/api/tags?`
  console.log(`Fetching OLLAMA models from ${modelUrl}`)
  const ollamaModelsResponse = await fetch(modelUrl)
  if (!ollamaModelsResponse.ok) {
    console.error('Failed to fetch OLLAMA models:', ollamaModelsResponse.statusText)
    console.error('Response:', await ollamaModelsResponse.text())
    // Throwing an error to ensure the calling function handles it appropriately
    throw new Error('Failed to fetch OLLAMA models')
  }

  const responseContent = await ollamaModelsResponse.json()
  const ollamaModelsContent = responseContent as {
    models: { name: string; model: string }[]
  }

  return (
    ollamaModelsContent.models
      //.filter((model) => isEmbeddingModel(model.name))
      .map((model) => ({
        modelName: model.name,
        title: model.model,
        type: 'Ollama',
        options: [
          { key: 'temperature', value: '0.7' },
          { key: 'maxTokens', value: '80000' },
        ],
      }))
      .sort((a, b) => a.modelName.localeCompare(b.modelName))
  )
}

export const getEmbeddingsModelInstance = async (modelName: string): Promise<OllamaEmbeddings> => {
  const embeddings = new OllamaEmbeddings({
    model: modelName,
    baseUrl: process.env.OLLAMA_BASE_URL,
    keepAlive: '5m',
  })

  return embeddings
}
