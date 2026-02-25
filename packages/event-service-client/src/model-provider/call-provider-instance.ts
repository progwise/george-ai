import { eventClient } from '../client'
import { getProviderCallDirectSubject } from './common'
import {
  DiscoverModelsResponse,
  ProviderRequest,
  ProviderResponseSchema,
  ProviderStatusResponse,
  RequestDiscoverModels,
  RequestStatus,
  RequestTestConnection,
  TestConnectionResponse,
} from './schema'

export async function callProviderInstance(request: RequestTestConnection): Promise<TestConnectionResponse>
export async function callProviderInstance(request: RequestDiscoverModels): Promise<DiscoverModelsResponse>
export async function callProviderInstance(request: RequestStatus): Promise<ProviderStatusResponse>
export async function callProviderInstance(request: ProviderRequest) {
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
