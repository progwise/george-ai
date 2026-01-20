import { Provider } from '../provider/common'

export const PROVIDER_HEALTH_BUCKET_NAME = 'provider-health'

export const getKey = (args: { workspaceId: string; provider: string; providerInstanceId: string }) =>
  `workspace.${args.workspaceId}.provider.${args.provider}.instance.${args.providerInstanceId}.health`

export const getWildcardKey = (args: { workspaceId: string; provider?: Provider }) =>
  args.provider
    ? `workspace.${args.workspaceId}.provider.${args.provider}.instance.*.health`
    : `workspace.${args.workspaceId}.provider.*.instance.*.health`
