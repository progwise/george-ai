import { ModelProvider } from '@george-ai/app-commons'
import { createLogger } from '@george-ai/app-commons'

export const MODEL_CALL_TYPES = ['generateEmbedding', 'generateChatCompletion', 'generateImage'] as const
export type ModelCallType = (typeof MODEL_CALL_TYPES)[number]

export const MODEL_CALLS_STREAM_NAME = 'model_calls'
export const MODEL_CALLS_BATCH_SUBJECT_PREFIX = 'modelcalls.batch.workspace'
export const MODEL_CALLS_DIRECT_SUBJECT_PREFIX = 'modelcalls.direct.workspace'
export const MODEL_CALLS_STREAM_SUBJECTS = [
  `${MODEL_CALLS_BATCH_SUBJECT_PREFIX}.>`,
  `${MODEL_CALLS_DIRECT_SUBJECT_PREFIX}.>`,
]

export const logger = createLogger('event-service-client:model-calls')

export const getBatchCallSubject = (args: {
  workspaceId: string
  provider: ModelProvider
  modelCallType: ModelCallType
  modelName: string
}) => {
  return `${MODEL_CALLS_BATCH_SUBJECT_PREFIX}.${args.workspaceId}.provider.${args.provider}.call.${args.modelCallType}.model.${args.modelName}`
}

export const getDirectCallSubject = (event: {
  workspaceId: string
  provider: ModelProvider
  modelCallType: ModelCallType
  modelName: string
}) => {
  return `${MODEL_CALLS_DIRECT_SUBJECT_PREFIX}.${event.workspaceId}.provider.${event.provider}.call.${event.modelCallType}.model.${event.modelName}`
}

export const getBatchResponseSubject = (args: {
  workspaceId: string
  provider: ModelProvider
  modelCallType: ModelCallType
  modelName: string
}) => {
  return `${MODEL_CALLS_BATCH_SUBJECT_PREFIX}.${args.workspaceId}.provider.${args.provider}.response.${args.modelCallType}.model.${args.modelName}`
}

export const getBatchResponseSubjectFilter = (args: { modelCallType: ModelCallType }) => {
  return `${MODEL_CALLS_BATCH_SUBJECT_PREFIX}.*.provider.*.response.${args.modelCallType}`
}

export const getBatchConsumerGlobPattern = (args: {
  workspaceId?: string
  modelProvider?: ModelProvider
  providerInstanceId?: string
}): string => {
  const { workspaceId, modelProvider, providerInstanceId } = args
  return `workspace-provider-instance-batch-consumer-${workspaceId ?? '*'}-${modelProvider ?? '*'}-${providerInstanceId ?? '*'}`
}

export const getBatchConsumerName = (args: {
  workspaceId: string
  modelProvider: ModelProvider
  providerInstanceId: string
  eventType: 'call' | 'response'
}): string => {
  const { workspaceId, modelProvider, providerInstanceId, eventType } = args
  return `workspace-provider-instance-batch-consumer-${workspaceId}-${modelProvider}-${providerInstanceId}-${eventType}`
}

export const getBatchConsumerSubjectFilters = (args: {
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
