import { OllamaEmbeddings } from '@langchain/ollama'

export const getOllamaEmbedding = async (embeddingModelName: string, question: string) => {
  const embeddings = new OllamaEmbeddings({
    model: embeddingModelName,
    baseUrl: process.env.OLLAMA_BASE_URL,
    headers: process.env.OLLAMA_API_KEY ? { 'X-API-Key': `${process.env.OLLAMA_API_KEY}` } : undefined,
    keepAlive: '5m',
  })
  return await embeddings.embedQuery(question)
}
