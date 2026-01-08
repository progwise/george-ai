import { ollamaApi } from '../ollama'
import { openAiApi } from '../openAi'
import { logger } from './common'
import { getBestInstance } from './get-best-instance'
import { addProviderInstance, removeWorkspaceFromCache } from './instance-cache'

export async function setWorkspaceProviderInstances(
  workspaceId: string,
  instances: {
    provider: string
    apiKey?: string
    baseUrl?: string
  }[],
) {
  removeWorkspaceFromCache(workspaceId)
  const instancePromises = instances.map(async (instance) => {
    if (instance.provider !== 'openai' && instance.provider !== 'ollama') {
      logger.warn(`Unsupported provider ${instance.provider} for workspace ${workspaceId}, skipping instance setup`)
      return Promise.resolve()
    }
    await addProviderInstance({
      workspaceId,
      provider: instance.provider,
      options: {
        apiKey: instance.apiKey,
        url: instance.baseUrl,
      },
    })
  })
  await Promise.all(instancePromises)
}

export async function getChunkVectors(
  workspaceId: string,
  provider: string,
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
      if (!instance.url) {
        logger.error('Ollama instance URL is required')
        throw new Error('Ollama instance URL is required')
      }
      return await ollamaApi.generateOllamaEmbeddings({ url: instance.url, apiKey: instance.apiKey }, modelName, chunks)
    } else {
      throw new Error(`Unsupported provider for embeddings: ${provider}`)
    }
  } finally {
    instance.semaphore.release()
  }
}
