import { createLogger } from '@george-ai/web-utils'

export const AI_SERVICE_CALLS_STREAM_NAME = 'ai-service-tasks'
export const AI_SERVICE_CALLS_STREAM_SUBJECTS = ['ai.tasks.workspace.>']

export const logger = createLogger('event-service-client:provider-calls')

export const getTaskSubject = (args: {
  workspaceId: string
  provider: string
  callType: string
  modelName: string
}) => {
  return `ai.tasks.workspace.${args.workspaceId}.provider.${args.provider}.call.${args.callType}.model.${args.modelName}`
}

export const getRequestSubject = (args: {
  workspaceId: string
  provider: string
  callType: string
  modelName: string
}) => {
  return `ai.requests.workspace.${args.workspaceId}.provider.${args.provider}.call.${args.callType}.model.${args.modelName}`
}

export const getRespondSubjectFilter = (args: { callType: string }) => {
  return `ai.responses.workspace.*.provider.*.call.${args.callType}.model.*`
}

export const getConsumerName = (args: {
  workspaceId: string
  provider: string
  providerInstanceId: string
}): string => {
  const { workspaceId, provider, providerInstanceId } = args
  return `workspace-provider-instance-consumer-${workspaceId}-${provider}-${providerInstanceId}`
}

export const getConsumerSubjectFilters = (args: { workspaceId: string; provider: string; modelNames: string[] }) => {
  return args.modelNames.map(
    (modelName) => `ai.tasks.workspace.${args.workspaceId}.provider.${args.provider}.call.*.model.${modelName}`,
  )
}
