import { ChatOllama } from '@langchain/ollama'
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai'

import { decryptValue } from '@george-ai/app-commons/src/encryption'
import { InferenceDriver } from '@george-ai/app-schema'
import { getState } from '@george-ai/event-service-client'

import { logger } from './common'

export type AssistantModel = ChatOllama | ChatOpenAI<ChatOpenAICallOptions>
// BaseChatModel<BaseChatModelCallOptions, AIMessageChunk>

export const getModel = async (workspaceId: string, modelProvider: InferenceDriver, modelName: string) => {
  // Get workspace providers from cache (with auto-refresh)
  const modelStates = await getState({ type: 'inferenceModel', workspaceId, driver: modelProvider, modelName })

  if (modelStates.length < 1) {
    logger.warn('No model state for configuration available.', { workspaceId, modelProvider, modelName })
    throw new Error(`No model state for configuration available: ${workspaceId}, ${modelProvider}, ${modelName}`)
  }

  const chosenConnection = modelStates.sort((a, b) =>
    a.connected && !b.connected
      ? 1
      : !a.connected && b.connected
        ? -1
        : a.responseTimeMsPerToken - b.responseTimeMsPerToken,
  )[0].connection

  logger.debug('Chosen model connection', { workspaceId, modelProvider, modelName, connection: chosenConnection })

  if (chosenConnection.driver === 'ollama') {
    return new ChatOllama({
      model: modelName,
      baseUrl: chosenConnection.baseUrl,
      headers: chosenConnection.encryptedApiKey
        ? { Authorization: `Bearer ${decryptValue(chosenConnection.encryptedApiKey)}` }
        : undefined,
    })
  } else if (chosenConnection.driver === 'openai') {
    return new ChatOpenAI({
      modelName: modelName,
      apiKey: decryptValue(chosenConnection.encryptedApiKey),
    })
  }

  logger.error('Unsupported model provider', { modelProvider })
  throw new Error(`Unsupported model provider: ${modelProvider}`)
}
