import { OllamaEmbeddings } from '@langchain/ollama'

export const getOllamaEmbeddingsModel = async (model: string): Promise<OllamaEmbeddings> => {
  const embeddings = new OllamaEmbeddings({
    model,
    baseUrl: process.env.OLLAMA_BASE_URL,
    headers: process.env.OLLAMA_API_KEY ? { 'X-API-Key': `${process.env.OLLAMA_API_KEY}` } : undefined,
    keepAlive: '5m',
  })

  return embeddings
}
