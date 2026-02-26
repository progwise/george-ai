import { ModelProvider, createLogger, getModelProvider } from '@george-ai/app-commons'

import { ProviderInstanceRequestType } from './schema'

export const PROVIDER_INSTANCE_BUCKET_NAME = 'provider-instance'

export const logger = createLogger('event-service-client:provider-instance')

export const getKey = (args: { workspaceId?: string; modelProvider?: ModelProvider; providerInstanceId?: string }) =>
  `workspace.${args.workspaceId ? args.workspaceId : '*'}.provider.${args.modelProvider ? args.modelProvider : '*'}.instance.${args.providerInstanceId ? args.providerInstanceId : '*'}`

export const getWildcardKey = (args: { workspaceId?: string; modelProvider?: ModelProvider }) =>
  `workspace.${args.workspaceId ? args.workspaceId : '*'}.provider.${args.modelProvider ? args.modelProvider : '*'}.instance.*`

export const parseKey = (
  key: string,
): { workspaceId: string; modelProvider: ModelProvider; providerInstanceId: string } => {
  const regex = /^workspace\.(.+)\.provider\.(.+)\.instance\.(.+)$/
  const match = key.match(regex)
  if (!match) {
    throw new Error(`Invalid provider instance key format: ${key}`)
  }
  const [, workspaceId, modelProvider, providerInstanceId] = match
  return { workspaceId, modelProvider: getModelProvider(modelProvider), providerInstanceId }
}

export function getRequestSubject(parameters: {
  workspaceId?: string
  modelProvider?: ModelProvider
  requestType?: ProviderInstanceRequestType
}) {
  const { modelProvider, requestType, workspaceId } = parameters
  return `workspace.${workspaceId ? workspaceId : '*'}.provider.${modelProvider ? modelProvider : '*'}.request.${requestType ? requestType : '*'}`
}
