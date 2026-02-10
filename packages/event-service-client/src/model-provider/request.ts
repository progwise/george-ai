import { eventClient } from '../client'
import { getProviderCallDirectSubject } from './common'
import {
  DiscoverModelsResponse,
  ProviderCallType,
  ProviderRequest,
  ProviderRequestSchema,
  ProviderResponse,
  ProviderResponseSchema,
  ProviderStatusResponse,
  RequestDiscoverModels,
  RequestStatus,
  RequestTestConnection,
  TestConnectionResponse,
} from './schema'

export async function directCall(request: RequestTestConnection): Promise<TestConnectionResponse>
export async function directCall(request: RequestDiscoverModels): Promise<DiscoverModelsResponse>
export async function directCall(request: RequestStatus): Promise<ProviderStatusResponse>
export async function directCall(request: ProviderRequest) {
  const { workspaceId, providerId, callType } = request
  const subject = getProviderCallDirectSubject({ workspaceId, providerId, callType })
  const payload = new TextEncoder().encode(JSON.stringify(request))

  const response = await eventClient.request({
    subject,
    payload,
  })
  const decodedResponse = new TextDecoder().decode(response)
  const parsedResponse = ProviderResponseSchema.parse(JSON.parse(decodedResponse))
  return parsedResponse
}

export async function respondDirectCall<T extends ProviderRequest>(parameters: {
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
