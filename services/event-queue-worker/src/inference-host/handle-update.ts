import { InferenceHostConfig, deleteState, getState, writeState } from '@george-ai/event-service-client'
import { statusReport } from '@george-ai/llm-client'

import { logger } from '../common'

export async function handleInferenceHostUpdate(config: InferenceHostConfig) {
  logger.debug('update inference host config', { config })

  const { workspaceId, hostId } = config

  const existingModelState = await getState({ type: 'inferenceModel', workspaceId, hostId })

  const report = await statusReport(config.connection).catch((error) => {
    logger.error('Cannot obtain inference host status', { config, error })
    return null
  })

  await writeState({
    type: 'inferenceHost',
    workspaceId,
    hostId,
    version: 1,
    connection: config.connection,
    state: report && report.isConnected ? 'healthy' : 'unknown',
    lastHealthCheck: new Date(),
    lastTestConnection: new Date(),
    processorUsagePercent: report?.processorUsagePercent,
  })

  if (!report) {
    await deleteState({ type: 'inferenceModel', workspaceId, hostId })
    return
  }

  const discoveredModels = new Set(report.availableModelNames || [])
  const loadedModels = new Set(report.loadedModelNames || [])

  const modelStatesToDelete = existingModelState.filter((modelState) => !discoveredModels.has(modelState.modelName))

  await Promise.all(
    modelStatesToDelete.map(async (modelState) => {
      await deleteState({
        type: 'inferenceModel',
        workspaceId,
        hostId,
        driver: modelState.connection.driver,
        modelName: modelState.modelName,
      })
    }),
  )

  for (const discoveredModel in discoveredModels) {
    const existingModel = existingModelState.find((state) => state.modelName === discoveredModel)
    await writeState({
      type: 'inferenceModel',
      version: 1,
      workspaceId,
      hostId,
      connection: config.connection,
      callCount: existingModel?.callCount || 0,
      errorCount: existingModel?.errorCount || 0,
      loadState: loadedModels.has(discoveredModel) ? 'loaded' : 'installed',
      modelName: discoveredModel,
      responseTimeMsPerToken: existingModel?.responseTimeMsPerToken,
    })
  }
}
