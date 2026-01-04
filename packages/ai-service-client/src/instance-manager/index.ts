import { ollamaApi } from '../ollama'
import { openAiApi } from '../openAi'
import { ServiceProviderType } from '../types'
import { getBestInstance } from './get-best-instance'

export async function getChunkVectors(
  workspaceId: string,
  provider: ServiceProviderType,
  modelName: string,
  chunks: string[],
): Promise<{ usage: { promptTokens: number; totalTokens: number }; embeddings: number[][] }> {
  const instance = await getBestInstance({
    workspaceId,
    provider,
    modelName,
  })

  await instance.semaphore.acquire()

  try {
    if (provider === 'openai') {
      return await openAiApi.generateOpenAIEmbeddings(
        { url: instance.url || 'https://api.openai.com/v1', apiKey: instance.apiKey! },
        modelName,
        chunks,
      )
    } else if (provider === 'ollama') {
      return await ollamaApi.generateOllamaEmbeddings(
        { url: instance.url || 'http://localhost:11434', apiKey: instance.apiKey },
        modelName,
        chunks,
      )
    } else {
      throw new Error(`Unsupported provider for embeddings: ${provider}`)
    }

    // Flatten the array of vectors into a single array
  } finally {
    instance.semaphore.release()
  }
}
