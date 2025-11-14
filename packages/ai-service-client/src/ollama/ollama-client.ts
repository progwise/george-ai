import { Ollama } from 'ollama'

export const getOllamaClient = (instance: { url: string; apiKey?: string }) => {
  const client = new Ollama({
    host: instance.url,
    headers: instance.apiKey ? { 'X-API-Key': instance.apiKey } : undefined,
  })

  return client
}
