import { OllamaEmbeddings } from '@langchain/ollama'

export const getEmbeddingModels = async () => {
  if (!process.env.OLLAMA_BASE_URL || process.env.OLLAMA_BASE_URL.length < 1) {
    throw new Error('OLLAMA_BASE_URL environment variable is not set')
  }
  const ollamaModelsResponse = await fetch(`${process.env.OLLAMA_BASE_URL}/api/tags`)
  if (!ollamaModelsResponse.ok) {
    throw new Error('Failed to fetch OLLAMA models')
  }
  const ollamaModelsContent = await ollamaModelsResponse.json()
  const foundModels = ollamaModelsContent.models.map((model: { name: string; model: string }) => ({
    modelName: model.name,
    title: model.model,
    type: 'Ollama',
    options: [
      { key: 'temperature', value: '0.7' },
      { key: 'maxTokens', value: '80000' },
    ],
  }))
  return foundModels as { modelName: string; title: string; type: string; options: { key: string; value: string }[] }[]
}

export const getEmbeddingsModelInstance = async (modelName: string): Promise<OllamaEmbeddings> => {
  const embeddings = new OllamaEmbeddings({
    model: modelName,
    baseUrl: process.env.OLLAMA_BASE_URL,
    keepAlive: '5m',
  })

  return embeddings
}
