import { ModelProvider } from '@george-ai/app-commons'

import { MODEL_CALLS_BATCH_SUBJECT_PREFIX } from './common'

export const getConsumerGlobPattern = (args: {
  workspaceId?: string
  modelProvider?: ModelProvider
  providerInstanceId?: string
}): string => {
  const { workspaceId, modelProvider, providerInstanceId } = args
  return `workspace-provider-instance-batch-consumer-${workspaceId ?? '*'}-${modelProvider ?? '*'}-${providerInstanceId ?? '*'}`
}

export const getConsumerName = (args: {
  workspaceId: string
  modelProvider: ModelProvider
  providerInstanceId: string
  eventType: 'call' | 'response'
}): string => {
  const { workspaceId, modelProvider, providerInstanceId, eventType } = args
  return `workspace-provider-instance-batch-consumer-${workspaceId}-${modelProvider}-${providerInstanceId}-${eventType}`
}

export const getConsumerSubjectFilters = (args: {
  workspaceId: string
  modelProvider: ModelProvider
  modelNames: string[]
  eventType: 'call' | 'response'
}) => {
  return args.modelNames.map(
    (modelName) =>
      `${MODEL_CALLS_BATCH_SUBJECT_PREFIX}.${args.workspaceId}.provider.${args.modelProvider}.${args.eventType}.*.model.${modelName}`,
  )
}
