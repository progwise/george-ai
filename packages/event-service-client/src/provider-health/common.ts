import { ModelProvider } from '@george-ai/app-commons'

export const PROVIDER_HEALTH_BUCKET_NAME = 'provider-health'

export const getKey = (args: { workspaceId: string; modelProvider: ModelProvider; providerInstanceId: string }) =>
  `workspace.${args.workspaceId}.provider.${args.modelProvider}.instance.${args.providerInstanceId}.health`

export const getWildcardKey = (args: { workspaceId: string; modelProvider?: ModelProvider }) =>
  args.modelProvider
    ? `workspace.${args.workspaceId}.provider.${args.modelProvider}.instance.*.health`
    : `workspace.${args.workspaceId}.provider.*.instance.*.health`
