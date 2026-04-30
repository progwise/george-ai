import { createLogger } from '@george-ai/app-commons'
import { InferenceDriver, InferenceHostConnection } from '@george-ai/app-schema'
import { getState } from '@george-ai/event-service-client'

export const logger = createLogger('event-queue-worker:model-call-responder')

export async function getInferenceModelConnection(params: {
  driver: InferenceDriver
  workspaceId: string
  modelName: string
}): Promise<InferenceHostConnection | null> {
  const { driver, workspaceId, modelName } = params

  const loadedModels = await getState({
    type: 'inferenceModel',
    workspaceId,
    driver,
    modelName,
    loadState: 'loaded',
  })

  if (loadedModels.length > 0) {
    return loadedModels.sort((a, b) => a.errorCount - b.errorCount)[0].connection
  }

  const allModels = await getState({ type: 'inferenceModel', workspaceId, driver, modelName })

  if (allModels.length < 1) {
    logger.warn('no model connection in state', params)
    return null
  }

  return allModels.sort((a, b) => a.errorCount - b.errorCount)[0].connection
}
