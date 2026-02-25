import { eventClient } from '../client'
import { getProviderCallDirectSubject } from './common'
import { ProviderCallType, ProviderRequest, ProviderRequestSchema, ProviderResponse } from './schema'

export async function respondProviderInstanceCalls<T extends ProviderRequest>(parameters: {
  workspaceId?: string
  providerId?: string
  callType?: ProviderCallType
  handler: (request: T) => Promise<ProviderResponse>
}) {
  const { workspaceId, providerId, callType, handler } = parameters
  const subject = getProviderCallDirectSubject({ workspaceId, providerId, callType })
  const cleanup = await eventClient.respond({
    subject,
    handler: async (payload) => {
      const decoded = new TextDecoder().decode(payload)
      const parsed = JSON.parse(decoded)
      const request = ProviderRequestSchema.parse(parsed) as T
      const response = await handler(request)
      return new TextEncoder().encode(JSON.stringify(response))
    },
  })
  return async () => {
    await cleanup()
  }
}
