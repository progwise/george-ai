import { prisma } from '@george-ai/app-database'
import { InferenceDriver, InferenceModel } from '@george-ai/app-schema'
import { getRegistryEntry, writeRegistryEntry } from '@george-ai/event-service-client'

import { logger } from '../common'
import { DomainError } from '../error'

export async function toggleInferenceModelEnabled(params: {
  workspaceId: string
  modelName: string
  driver: InferenceDriver
  enabled: boolean
}): Promise<InferenceModel> {
  const { modelName, workspaceId, enabled } = params

  const workspaceConfig = await getRegistryEntry({ type: 'workspace', workspaceId })

  if (!workspaceConfig) {
    logger.error('Cannot toggle inference model because workspaceConfig config not found', {
      workspaceId,
      modelName,
      enabled,
    })
    throw new DomainError(
      `Cannot ${enabled ? 'enable' : 'disable'} inference model ${modelName} because workspace config for ${workspaceId} not found`,
      'workspace',
    )
  }

  const modelInWorkspace = workspaceConfig.inferenceModels.find(
    (model) => model.name === modelName && model.driver === params.driver,
  )

  if (!modelInWorkspace) {
    logger.error('Cannot toggle inference model because inference model not found in workspace config', {
      workspaceId,
      modelName,
      enabled,
    })
    throw new DomainError(
      `Cannot ${enabled ? 'enable' : 'disable'} inference model ${modelName} because model config not found in workspace config ${workspaceId}`,
      'workspace',
    )
  }

  if (modelInWorkspace.enabled === enabled) {
    logger.warn(`Inference model is already ${enabled ? 'enabled' : 'disabled'}`, { workspaceId, modelName })
    return modelInWorkspace
  }

  await prisma.aiLanguageModel.updateMany({
    where: {
      name: modelName,
      workspaceId,
      provider: params.driver,
    },
    data: {
      enabled,
    },
  })

  const updatedModel = {
    ...modelInWorkspace,
    enabled,
  }

  const updatedModels = workspaceConfig.inferenceModels.map((model) =>
    model.name === modelName && model.driver === params.driver ? updatedModel : model,
  )

  await writeRegistryEntry({
    ...workspaceConfig,
    inferenceModels: updatedModels,
  })

  logger.debug(`Inference model ${enabled ? 'enabled' : 'disabled'} successfully`, { workspaceId, modelName })
  return updatedModel
}
