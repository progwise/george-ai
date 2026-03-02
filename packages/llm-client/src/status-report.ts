import { ProviderConnection } from '@george-ai/app-commons'

import { logger } from './common'
import { getOllamaModels, getOllamaRunningModels, getOllamaVersion } from './ollama'
import { getOpenAIModels } from './openAi'

export interface StatusReport {
  url: string
  isConnected: boolean
  version?: string
  latencyMs?: number
  connectionErrorMessage?: string
  totalMemoryMb?: number
  usedMemoryMb?: number
  processorUsagePercent?: number
  loadedModelNames?: string[]
  availableModelNames?: string[]
}

export async function statusReport(connection: ProviderConnection): Promise<StatusReport> {
  const abortController = new AbortController()

  switch (connection.modelProvider) {
    case 'ollama': {
      const startTime = Date.now()
      const [ollamaVersion, ollamaModels, ollamaRunningModels] = await Promise.allSettled([
        getOllamaVersion(connection, abortController.signal),
        getOllamaModels(connection, abortController.signal),
        getOllamaRunningModels(connection, abortController.signal),
      ])
      const latencyMs = Date.now() - startTime

      return {
        url: connection.baseUrl,
        isConnected: ollamaVersion.status === 'fulfilled',
        version: ollamaVersion.status === 'fulfilled' ? ollamaVersion.value.version : undefined,
        latencyMs,
        connectionErrorMessage: ollamaVersion.status === 'rejected' ? ollamaVersion.reason.message : undefined,
        availableModelNames:
          ollamaModels.status === 'fulfilled' ? ollamaModels.value.models.map((model) => model.name) : undefined,
        loadedModelNames:
          ollamaRunningModels.status === 'fulfilled'
            ? ollamaRunningModels.value.models.map((model) => model.name)
            : undefined,
        usedMemoryMb:
          ollamaRunningModels.status === 'fulfilled'
            ? ollamaRunningModels.value.models.reduce((sum, model) => sum + model.size_vram, 0)
            : undefined,
        totalMemoryMb: undefined, // Ollama does not currently provide total memory info
        processorUsagePercent: undefined, // Ollama does not currently provide CPU usage info
      }
    }
    case 'openai': {
      const startTime = Date.now()
      const [openAiModels] = await Promise.allSettled([
        getOpenAIModels(connection, abortController.signal),
        // TODO: Find out more possibilities for openAi status reporting
      ])
      const latencyMs = Date.now() - startTime
      return {
        url: 'https://api.openai.com',
        isConnected: openAiModels.status === 'fulfilled',
        latencyMs,
        connectionErrorMessage: openAiModels.status === 'rejected' ? openAiModels.reason.message : undefined,
        availableModelNames:
          openAiModels.status === 'fulfilled' ? openAiModels.value.data.map((model) => model.id) : undefined,
        loadedModelNames: undefined, // OpenAI does not provide info on currently loaded models
        usedMemoryMb: undefined, // OpenAI does not provide memory usage info
        totalMemoryMb: undefined, // OpenAI does not provide total memory info
        processorUsagePercent: undefined, // OpenAI does not provide CPU usage info
      }
    }
    default:
      logger.error('Status report for connection not implemented', connection)
      throw new Error('Status Report not implemented for model provider')
  }
}
