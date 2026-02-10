import { createLogger } from '@george-ai/app-commons'

import { ProviderCallType } from './schema'

export const MODEL_PROVIDER_CALLS_DIRECT_SUBJECT_PREFIX = 'providercalls.direct.workspace'

export const logger = createLogger('event-service-client:model-provider')

export function getProviderCallDirectSubject(parameters: {
  workspaceId?: string | null
  providerId?: string | null
  callType?: ProviderCallType
}) {
  const { workspaceId, providerId, callType } = parameters
  return `${MODEL_PROVIDER_CALLS_DIRECT_SUBJECT_PREFIX}.${workspaceId || '*'}.provider.${providerId || '*'}.callType.${callType || '*'}`
}
