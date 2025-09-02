import { ChatOllama } from '@langchain/ollama'

const headers = new Headers()

if (process.env.OLLAMA_API_KEY) {
  headers.append('X-API-Key', process.env.OLLAMA_API_KEY)
}
export const getOllamaChatModel = (modelName: string) => {
  return new ChatOllama({
    model: modelName,
    baseUrl: process.env.OLLAMA_BASE_URL,
    headers,
  })
}
